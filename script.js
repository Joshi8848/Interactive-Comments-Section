"use strict";

const voteAddButton = document.querySelector(".fa-plus");
const voteMinusButton = document.querySelector(".fa-minus");
const container = document.querySelector(".app-container");
// const newComment = document.querySelector(".new-comment");
const inputField = document.querySelector(".input-comment");
const sendButton = document.getElementById("send");

let reply = false;
let currId;
let comments;
let id = 50;
let replyInput;
let updateInput;
let replyBox;
let html;
let update = true;

class Person {
  constructor(id, username) {
    this.id = id;
    this.username = username;
  }
}

class PersonInfo extends Person {
  constructor(
    id,
    username,
    score,
    picture,
    message,
    createdAt,
    type,
    parentId
  ) {
    super(id, username);
    this.score = score;
    this.picture = picture;
    this.message = message;
    this.createdAt = createdAt;
    this.type = type;
    this.parentId = parentId;
  }
}

class App {
  #personInfo = [];

  constructor() {
    this._fetchData();
    this._getCommentHtml();
    sendButton.addEventListener("click", this._mainUserInfo.bind(this));
  }

  async _fetchData() {
    const getData = await fetch("data.json");
    const data = await getData.json();
    console.log(data);
    this._getCommentsdata(data);
    this._getLocalStorage();
  }

  _getCommentsdata(data) {
    comments = data.comments;

    console.log(comments);

    comments.forEach((cmt, i) => {
      const comment = new PersonInfo(
        cmt.id,
        cmt.user.username,
        cmt.score,
        cmt.user.image.webp,
        cmt.content,
        cmt.createdAt
      );

      // this.#personInfo.push(comment);
      this._addComments(comment, null);
      if (cmt && cmt.replies.length > 0) {
        const info = cmt.replies;

        info.forEach((rep, ind) => {
          const type = "reply";

          if (rep.user.username === "juliusomo") return;
          const reply = new PersonInfo(
            rep.id,
            rep.user.username,
            rep.score,
            rep.user.image.webp,
            rep.content,
            rep.createdAt,
            type,
            cmt.id
          );

          // this.#personInfo.push(reply);
          this._addComments(null, reply);
        });
      }
    });
  }

  _addComments(comment, reply) {
    console.log(comment ? comment.id : reply.id);
    const html = `
      <div class="${comment ? "comment" : "comment reply"}">
      ${reply ? "<hr>" : ""}
        <div class="vote-container">
          <div class="votes">
            <i class="fa-solid fa-plus"></i>
            <span id="vote-count">${
              comment ? comment.score : reply.score
            }</span>
            <i class="fa-solid fa-minus"></i>
          </div>
        </div>
        <div class="info-container">
          <div class="infos">
            <div class="info-header">
              <img src="${
                comment ? comment.picture : reply.picture
              }" alt="Picture of user ${
      comment ? comment.username : reply.username
    }" />
              <h4>${comment ? comment.username : reply.username}</h4>
              <h5>${comment ? comment.createdAt : reply.createdAt}</h5>
            </div>
            
            <div class="cmt-reply" data-id="${
              comment ? comment.id : reply.id
            }"> <i class="fa-solid ${
      comment?.username === "juliusomo"
        ? "fa-ellipsis"
        : reply?.username === "juliusomo"
        ? "fa-ellipsis"
        : "fa-reply"
    }" ></i> <h6>${
      comment?.username === "juliusomo"
        ? ""
        : reply?.username === "juliusomo"
        ? ""
        : "Reply"
    }</h6> 
    ${
      comment?.username === "juliusomo"
        ? `<div class="edit-icons">` +
          `<div class="pen" data-id="${comment ? comment.id : reply.id}">` +
          '<i class="fa-solid fa-pen"></i>' +
          '<span id="pen-text"> Edit </span>' +
          "</div>" +
          `<div class="trash" data-id="${comment ? comment.id : reply.id}">` +
          '<i class="fa-solid fa-trash"></i>' +
          '<span id="trash-text"> Delete </span>' +
          "</div>" +
          "</div>"
        : reply?.username === "juliusomo"
        ? `<div class="edit-icons">` +
          `<div class="pen" data-id="${comment ? comment.id : reply.id}">` +
          '<i class="fa-solid fa-pen"></i>' +
          '<span id="pen-text"> Edit </span>' +
          "</div>" +
          `<div class="trash" data-id="${comment ? comment.id : reply.id}">` +
          '<i class="fa-solid fa-trash"></i>' +
          '<span id="trash-text"> Delete </span>' +
          "</div>" +
          "</div>"
        : ""
    }
    </div>
          </div>
         
          <p class="comment-text">
            ${comment ? comment.message : reply.message}
          </p>
        </div>
      </div>
    `;

    if (comment) {
      currId = comment.id;
      console.log(currId);
      const cmtContainer = document.createElement("div");
      cmtContainer.classList.add("comment-container");
      cmtContainer.setAttribute("id", `${comment.id}`);
      cmtContainer.insertAdjacentHTML("beforeend", html);
      container.appendChild(cmtContainer);
    }

    if (reply) {
      const commentContainer = document.getElementById(`${reply.parentId}`);
      commentContainer.insertAdjacentHTML("beforeend", html);
    }

    const replyButton = document.querySelector(
      `.cmt-reply[data-id='${comment ? comment.id : reply.id}']`
    );

    if (comment?.username === "juliusomo" || reply?.username === "juliusomo") {
      console.log("gets here");
      // const editBtn = document.querySelector(
      //   `.edit-icons[data-key="${comment ? comment.id : reply.id}"]`
      // );
      // editBtn.addEventListener("click", this._displayEditInfo.bind(this));

      const editBtn = document.querySelector(
        `.pen[data-id="${comment ? comment.id : reply.id}"]`
      );
      const deleteBtn = document.querySelector(
        `.trash[data-id="${comment ? comment.id : reply.id}"]`
      );

      replyButton.addEventListener("click", this._displayEditInfo);

      editBtn.addEventListener("click", this._editComments.bind(this));

      deleteBtn.addEventListener("click", this._deleteComments.bind(this));
    } else {
      replyButton.addEventListener("click", this._getReplyName.bind(this));
    }

    if (update) update = false;
  }

  _getCommentHtml(reply, update) {
    html = `<div class="new-comment container reply-cnt">
    <img
      src="images/avatars/image-juliusomo.webp"
      alt="Picture of a person"
    />
    <form>
      <!-- prettier-ignore -->
      <textarea placeholder="Add a reply..." class="input-comment reply-comment update-comment"></textarea>
    </form>
    <button class="${
      reply ? "reply-btn" : update ? "update-btn" : ""
    }" id="send">${reply ? "REPLY" : "UPDATE"}</button>
  </div>`;
  }

  _getReplyName(e) {
    // let event;

    // e === undefined
    //   ? (event = false)
    //   : !e.target.classList.contains("fa-reply");

    if (!e.target.classList.contains("fa-reply")) return;
    if (replyBox) replyBox.remove();
    inputField.value = "";

    this._getCommentHtml(true, null);
    const container = e.target.closest(".comment-container");
    container.insertAdjacentHTML("beforeend", html);
    replyBox = document.querySelector(".reply-cnt");
    document
      .querySelector(".reply-btn")
      .addEventListener("click", this._mainUserInfo.bind(this));
    replyInput = document.querySelector(".reply-comment");
    const id = container.getAttribute("id");
    currId = id;
    const mainElement = e.target.parentElement.previousElementSibling;
    const username = mainElement.getElementsByTagName("h4")[0].innerHTML;
    replyInput.value = `${"@" + username}`;
    const end = replyInput.value.length;
    replyInput.setSelectionRange(end, end);
    replyInput.focus();
    reply = true;
  }

  _mainUserInfo() {
    const value = update
      ? updateInput.value
      : reply
      ? replyInput.value
      : inputField.value;
    console.log(value);
    const userName = "juliusomo";
    const img = "images/avatars/image-juliusomo.webp";
    const score = 0;
    const currTime = new Date().getSeconds();
    const ago = currTime + "second ago";
    const type = reply ? "reply" : "comment";

    const newObj = new PersonInfo(
      id,
      userName,
      score,
      img,
      value,
      ago,
      type,
      reply ? currId : {}
    );

    this.#personInfo.push(newObj);
    console.log(this.#personInfo);
    this._setLocalStorage();
    if (!reply) {
      this._addComments(newObj, null);
    } else {
      this._addComments(null, newObj);

      reply = false;
    }

    if (replyBox) replyBox.remove();
    id++;
  }

  _displayEditInfo(e) {
    if (!e.target.classList.contains("fa-ellipsis")) return;
    const btn = e.target;

    const close = btn.closest(".cmt-reply");

    const sibling = close.lastElementChild;

    sibling.classList.toggle("active");
  }

  _editComments(e) {
    const comment = e.target.closest(".comment");
    const container = e.target.closest(".comment-container");
    const cmtReply = comment.querySelector(".cmt-reply");
    console.log(cmtReply);
    comment.remove();
    this._getCommentHtml(null, true);
    container.insertAdjacentHTML("beforeend", html);

    replyBox = document.querySelector(".reply-cnt");

    document
      .querySelector(".update-btn")
      .addEventListener("click", this._mainUserInfo.bind(this));
    updateInput = document.querySelector(".update-comment");
    console.log(this.#personInfo);
    this.#personInfo.forEach((person, i) => {
      if (person.id === Number(cmtReply.dataset.id)) {
        const id = container.getAttribute("id");
        currId = id;
        updateInput.value = person.message;
        const end = updateInput.value.length;
        updateInput.setSelectionRange(end, end);
        updateInput.focus();
        console.log(person.type);
        if (person.type === "reply") {
          reply = true;
        } else {
          reply = false;
        }
        this.#personInfo.splice(i, 1);
        update = true;
      }
    });
  }

  _deleteComments(e) {
    console.log("hello delete");
    const comment = e.target.closest(".comment");
    console.log(comment);
    const cmtReply = comment.querySelector(".cmt-reply");
    console.log(cmtReply);
    this.#personInfo.forEach((person, i) => {
      if (person.id === Number(cmtReply.dataset.id)) {
        console.log("hey");
        this.#personInfo.splice(i, 1);
        this._setLocalStorage();
        comment.remove();
      }
    });
  }

  _setLocalStorage() {
    localStorage.setItem("comments", JSON.stringify(this.#personInfo));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("comments"));
    if (!data) return;
    data.forEach((ele) => {
      if (ele.type === "comment") this._addComments(ele, null);
      else this._addComments(null, ele);
      this.#personInfo.push(ele);
    });
  }
}

const app = new App();
