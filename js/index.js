const data = {
  currentUser: {
    image: {
      png: "./images/avatars/image-juliusomo.png",
      webp: "./images/avatars/image-juliusomo.webp",
    },
    username: "juliusomo",
  },
  comments: [
    {
      id: 1,
      parentId: null,
      content:
        "Impressive! Though it seems the drag feature could be improved. But overall it looks incredible. You've nailed the design and the responsiveness at various breakpoints works really well.",
      createdAt: establishOldDate(2022, 6, 10),
      score: 12,
      user: {
        image: {
          png: "./images/avatars/image-amyrobson.png",
          webp: "./images/avatars/image-amyrobson.webp",
        },
        username: "amyrobson",
      },
      replies: [],
    },
    {
      id: 2,
      parentId: null,
      content:
        "Woah, your project looks awesome! How long have you been coding for? I'm still new, but think I want to dive into React as well soon. Perhaps you can give me an insight on where I can learn React? Thanks!",
      createdAt: establishOldDate(2022, 6, 28),
      score: 5,
      user: {
        image: {
          png: "./images/avatars/image-maxblagun.png",
          webp: "./images/avatars/image-maxblagun.webp",
        },
        username: "maxblagun",
      },
      replies: [
        {
          id: 3,
          parentId: 2,
          content:
            "If you're still new, I'd recommend focusing on the fundamentals of HTML, CSS, and JS before considering React. It's very tempting to jump ahead but lay a solid foundation first.",
          createdAt: establishOldDate(2022, 7, 3),
          score: 4,
          replyingTo: "maxblagun",
          user: {
            image: {
              png: "./images/avatars/image-ramsesmiron.png",
              webp: "./images/avatars/image-ramsesmiron.webp",
            },
            username: "ramsesmiron",
          },
          replies: [],
        },
        // {
        //   id: 4,
        //   parentId: 2,
        //   content:
        //     "I couldn't agree more with this. Everything moves so fast and it always seems like everyone knows the newest library/framework. But the fundamentals are what stay constant.",
        //   createdAt: establishOldDate(2022, 7, 8),
        //   score: 2,
        //   replyingTo: "ramsesmiron",
        //   user: {
        //     image: {
        //       png: "./images/avatars/image-juliusomo.png",
        //       webp: "./images/avatars/image-juliusomo.webp",
        //     },
        //     username: "juliusomo",
        //   },
        //   replies: [],
        // },
      ],
    },
  ],
};

const locallyStoredComments = retrieveCommentsFromLocalStorage();

if (locallyStoredComments.length > 0) {
  aggregateStoredComments(locallyStoredComments);
}

const mainContainer = document.getElementById("main-container");

data.comments.forEach((comment) => {
  const commentToDisplay = renderComment(comment);
  mainContainer.append(commentToDisplay);
});

// // populate the add comment section below the posted comments
const submitComment = renderSubmitCommentForm(data.currentUser, "send");
mainContainer.appendChild(submitComment);

// // // create Delete Modal
const deleteModalSection = createDeleteModal();
document.body.append(deleteModalSection);

// // Handle Event Listeners

const deleteRows = document.querySelectorAll(".delete-row");
deleteRows.forEach((deleteRow) => {
  deleteRow.addEventListener("click", deleteComment);
});

const replyRows = document.querySelectorAll(".reply-row");
replyRows.forEach((replyRow) => {
  replyRow.addEventListener("click", replyToComment);
});

const editRows = document.querySelectorAll(".edit-text");
editRows.forEach((editRow) => {
  editRow.addEventListener("click", updateComment);
});

const submitCommentButtons = document.querySelectorAll(
  ".submit-comment-button"
);
submitCommentButtons.forEach((submitCommentButton) => {
  submitCommentButton.addEventListener("click", createNewComment);
});

///////  Functions ////////

///// CRUD functionality ////////

function createNewComment(e) {
  e.preventDefault();
  const newCommentObject = constructCommentObject();
  console.log(newCommentObject.id);
  const existingCommentsArray = retrieveCommentsFromLocalStorage();
  existingCommentsArray.push(newCommentObject);
  storeCommentsToLocalStorage(existingCommentsArray);
}

function replyToComment(e) {
  const commentNumber = findCommentNumber(e);
  renderReplyForm(commentNumber);
  const desktopReplyButton = document.getElementById(
    `replying-to-comment_${commentNumber}`
  );
  const mobileReplyButton = document.getElementById(
    `replying-to-comment-mobile_${commentNumber}`
  );
  desktopReplyButton.addEventListener("click", (event) => {
    event.preventDefault();
    const newCommentObject = constructCommentObject(commentNumber);
    const existingCommentsArray = retrieveCommentsFromLocalStorage();
    existingCommentsArray.push(newCommentObject);
    storeCommentsToLocalStorage(existingCommentsArray);
  });
  mobileReplyButton.addEventListener("click", (event) => {
    event.preventDefault();
    const newCommentObject = constructCommentObject(commentNumber);
    const existingCommentsArray = retrieveCommentsFromLocalStorage();
    existingCommentsArray.push(newCommentObject);
    storeCommentsToLocalStorage(existingCommentsArray);
  });
}

function updateComment(e) {
  const existingCommentsArray = retrieveCommentsFromLocalStorage();
  const commentIndexToUpdate = findClickedUserComment(e, existingCommentsArray);
  const commentNumber = findCommentNumber(e);
  renderUpdateCommentForm(commentNumber);
  const updatedCommentTextField = document.getElementById(
    `comment-text_${commentNumber}`
  );
  const updateCommentSubmitButton = document.getElementById(
    `update-comment_${commentNumber}`
  );
  updateCommentSubmitButton.addEventListener("click", () => {
    existingCommentsArray[commentIndexToUpdate].content =
      updatedCommentTextField.value;
    storeCommentsToLocalStorage(existingCommentsArray);
  });
}

function deleteComment(e) {
  const existingCommentsArray = retrieveCommentsFromLocalStorage();
  const commentIndexToDelete = findClickedUserComment(e, existingCommentsArray);
  console.log(commentIndexToDelete);
  deleteModalToggle();
  const confirmDelete = document.getElementById("confirm-delete");
  const cancelDelete = document.getElementById("cancel-delete");
  confirmDelete.addEventListener("click", () => {
    existingCommentsArray.splice(commentIndexToDelete, 1);
    storeCommentsToLocalStorage(existingCommentsArray);
  });
  cancelDelete.addEventListener("click", () => {
    location.reload();
  });
}

//// functions that build HTML ////

function constructCommentObject(replyingToCommentNumber = false) {
  const commentDate = new Date();
  const humanReadableDate = commentDate.toDateString();
  const newCommentObject = {
    id: parseInt(create_UUID(), 16),
    content: document.getElementById("comment-text-field").value,
    createdAt: humanReadableDate,
    score: 0,
    user: {
      image: {
        png: data.currentUser.image.png,
        webp: data.currentUser.image.webp,
      },
      username: data.currentUser.username,
    },
    replies: [],
  };
  if (replyingToCommentNumber) {
    newCommentObject.parentId = replyingToCommentNumber;
  } else {
    newCommentObject.parentId = null;
  }
  return newCommentObject;
}

function deleteModalToggle() {
  fadeBackgroundInOut();
  deleteModalSection.classList.toggle("hide");
}

function renderReplyForm(commentNumber) {
  const parentCommentToTarget = document.getElementById(
    `comment_${commentNumber}`
  );
  parentCommentToTarget.insertAdjacentElement(
    "afterend",
    renderSubmitCommentForm(data.currentUser, "reply", commentNumber)
  );
}

function renderUpdateCommentForm(commentNumber) {
  const originalCommentTextField = document.getElementById(
    `comment-text_${commentNumber}`
  );
  const updatedCommentTextField = createCommentTextField();
  originalCommentTextField.insertAdjacentElement(
    "afterend",
    updatedCommentTextField
  );
  updatedCommentTextField.innerText = originalCommentTextField.innerText;
  const submitUpdatedCommentButton = createSubmitButton("update");
  submitUpdatedCommentButton.setAttribute(
    "id",
    `update-comment_${commentNumber}`
  );
  submitUpdatedCommentButton.classList.add("update-comment-submit-button");
  updatedCommentTextField.insertAdjacentElement(
    "afterend",
    submitUpdatedCommentButton
  );
  const updatedCommentTextFieldId = originalCommentTextField.getAttribute("id");
  updatedCommentTextField.setAttribute("id", updatedCommentTextFieldId);
  originalCommentTextField.remove();
}

function renderComment(comment) {
  const commentContainer = createContainer("section", ["comment-container"]);
  commentContainer.setAttribute("id", `comment_${comment.id}`);

  //   // set upvote containers
  const desktopUpvoteContainer = createUpvoteContainer(comment, "upvote-col");
  const mobileUpvoteContainer = createUpvoteContainer(comment, "upvote-row");

  //   // comment top row
  const commentTopRow = createContainer("div", ["comment-top-row"]);
  const commentTopRowLeftWrapper = createContainer("div", [
    "comment-top-row-left-wrapper",
  ]);
  const userAvatar = setUserAvatar(comment.user);
  const userHeader = setUserHeader(comment);
  const currentUserLogo = setCurrentUserLogo(comment);
  const timeStamp = setTimeStamp(comment);
  const desktopUserButtons = setUserButtons(comment, "desktop");
  if (data.currentUser.username === comment.user.username) {
    commentTopRowLeftWrapper.append(
      userAvatar,
      userHeader,
      currentUserLogo,
      timeStamp
    );
  } else {
    commentTopRowLeftWrapper.append(userAvatar, userHeader, timeStamp);
  }
  commentTopRow.append(commentTopRowLeftWrapper, desktopUserButtons);

  //   // main comment body
  const commentTextContainer = createContainer("div", [
    "comment-text-container",
  ]);
  const commentText = setCommentText(comment);
  commentTextContainer.appendChild(commentText);

  //   // comment bottom row
  const commentBottomRow = createContainer("div", ["comment-bottom-row"]);
  const mobileUserButtons = setUserButtons(comment, "mobile");
  commentBottomRow.append(mobileUpvoteContainer, mobileUserButtons);

  // putting the comment together and handling replies with recursion!
  const commentBody = createContainer("div", ["comment-body"]);
  commentBody.append(commentTopRow, commentTextContainer, commentBottomRow);
  commentContainer.append(desktopUpvoteContainer, commentBody);
  const threadContainer = createContainer("article", ["thread-container"]);
  if (comment.replies.length > 0) {
    const repliesContainer = createContainer("section", ["replies-container"]);
    comment.replies.forEach((reply) => {
      const replyComment = renderComment(reply);
      repliesContainer.appendChild(replyComment);
    });
    threadContainer.append(commentContainer, repliesContainer);
  } else {
    threadContainer.append(commentContainer);
  }
  return threadContainer;
}

function renderSubmitCommentForm(
  currentUser,
  submitButtonText,
  replyingToComment = false
) {
  const commentForm = createContainer("form", [
    "submit-comment-container",
    "comment-container",
  ]);
  const submitCommentFormTopRow = createContainer("div", [
    "submit-comment-top-row",
  ]);
  const desktopUserAvatar = setUserAvatar(currentUser);
  desktopUserAvatar.classList.add("desktop-comment-form-avatar");
  const commentTextField = createCommentTextField();
  commentTextField.setAttribute("id", "comment-text-field");
  const desktopSubmitButton = createSubmitButton(submitButtonText);
  desktopSubmitButton.classList.add(
    "desktop-comment-submit-button",
    "submit-comment-button"
  );

  const submitCommentFormBottomRow = createContainer("div", [
    "submit-comment-bottom-row",
  ]);
  const mobileUserAvatar = setUserAvatar(currentUser);
  const mobileSubmitButton = createSubmitButton(submitButtonText);
  mobileSubmitButton.classList.add("submit-comment-button");
  if (replyingToComment) {
    desktopSubmitButton.setAttribute(
      "id",
      `replying-to-comment_${replyingToComment}`
    );
    desktopSubmitButton.setAttribute("type", "button");
    mobileSubmitButton.setAttribute(
      "id",
      `replying-to-comment-mobile_${replyingToComment}`
    );
    mobileSubmitButton.setAttribute("type", "button");
  }
  submitCommentFormTopRow.append(
    desktopUserAvatar,
    commentTextField,
    desktopSubmitButton
  );
  submitCommentFormBottomRow.append(mobileUserAvatar, mobileSubmitButton);
  commentForm.append(submitCommentFormTopRow, submitCommentFormBottomRow);
  return commentForm;
}

function createDeleteModal() {
  const deleteModal = document.createElement("section");
  deleteModal.classList.add("delete-modal", "hide");
  const deleteModalHeader = document.createElement("h1");
  deleteModalHeader.innerText = "Delete comment";
  deleteModalHeader.classList.add("delete-modal-header");
  const deleteModalText = document.createElement("p");
  deleteModalText.classList.add("delete-modal-text");
  deleteModalText.innerText =
    "Are you sure you want to delete this comment?  This will remove the comment and can't be undone";
  const deleteModalButtons = createContainer("div", ["delete-modal-buttons"]);
  const cancelDeleteButton = document.createElement("button");
  cancelDeleteButton.setAttribute("id", "cancel-delete");
  cancelDeleteButton.classList.add(
    "cancel-delete-button",
    "modal-button",
    "delete-button"
  );
  cancelDeleteButton.innerText = "No, cancel";
  const confirmDeleteButton = document.createElement("button");
  confirmDeleteButton.classList.add(
    "confirm-delete-button",
    "modal-button",
    "delete-button"
  );
  confirmDeleteButton.setAttribute("id", "confirm-delete");
  confirmDeleteButton.innerText = "Yes, delete";
  deleteModalButtons.append(cancelDeleteButton, confirmDeleteButton);
  deleteModal.append(deleteModalHeader, deleteModalText, deleteModalButtons);
  return deleteModal;
}

function createCommentTextField() {
  const commentTextField = document.createElement("textarea");
  commentTextField.classList.add("submit-comment-field", "comment-text");
  commentTextField.setAttribute("placeholder", "Add a comment...");
  commentTextField.setAttribute("rows", "4");
  return commentTextField;
}

function createSubmitButton(submitButtonText) {
  const submitButton = document.createElement("input");
  submitButton.setAttribute("type", "submit");
  submitButton.classList.add("comment-submit-button");
  submitButton.value = submitButtonText;
  return submitButton;
}

function createUpvoteContainer(comment, upvoteRowDirection) {
  const upvoteContainer = createContainer("div", [
    upvoteRowDirection,
    "upvote-container",
  ]);
  const plusImg = document.createElement("img");
  plusImg.setAttribute("src", "images/icon-plus.svg");
  plusImg.setAttribute("alt", "plus icon");
  plusImg.classList.add("plus-icon");
  plusImg.setAttribute("id", `plus-icon-for-comment_${comment.id}`);
  const score = document.createElement("p");
  score.innerText = comment.score;
  score.classList.add("score-text");
  const minusImg = document.createElement("img");
  minusImg.setAttribute("src", "images/icon-minus.svg");
  minusImg.setAttribute("alt", "minus icon");
  minusImg.setAttribute("id", `minus-icon-for-comment_${comment.id}`);
  minusImg.classList.add("minus-icon");
  upvoteContainer.append(plusImg, score, minusImg);
  return upvoteContainer;
}

function setUserAvatar(user) {
  const userAvatar = document.createElement("img");
  userAvatar.setAttribute("src", user.image.png);
  userAvatar.setAttribute("alt", "user's avatar");
  userAvatar.setAttribute("id", `user-avatar_${user.username}`);
  userAvatar.classList.add("user-avatar");
  return userAvatar;
}

function setUserHeader(comment) {
  const userHeader = document.createElement("h1");
  userHeader.innerText = comment.user.username;
  userHeader.classList.add("user-header");
  userHeader.setAttribute("id", `user-header_${comment.id}`);
  return userHeader;
}

function setCurrentUserLogo(comment) {
  const currentUserLogo = document.createElement("p");
  currentUserLogo.innerText = "you";
  currentUserLogo.classList.add("current-user-logo");
  return currentUserLogo;
}

function setTimeStamp(comment) {
  const timeStamp = document.createElement("h1");
  const commentDate = comment.createdAt;
  timeStamp.innerText = commentDate;
  timeStamp.classList.add("time-stamp");
  timeStamp.setAttribute("id", `time-stamp_${comment.id}`);
  return timeStamp;
}

function setCommentText(comment) {
  const text = document.createElement("p");
  text.setAttribute("id", `comment-text_${comment.id}`);
  text.classList.add("comment-text");
  if (comment.replyingTo) {
    const replyHandle = document.createElement("span");
    replyHandle.innerText = `@${comment.replyingTo} `;
    replyHandle.classList.add("reply-to-handle");
    text.append(replyHandle, comment.content);
  } else {
    text.innerText = comment.content;
  }
  return text;
}

function setUserButtons(comment, device) {
  const userButtonsContainer = createContainer("div", [
    `${device}-user-buttons`,
  ]);
  if (comment.user.username === data.currentUser.username) {
    const editOrDeleteRow = createContainer("div", ["edit-or-delete-row"]);
    const deleteRow = createContainer("div", ["delete-row", "delete-button"]);
    deleteRow.setAttribute("id", `delete-row_${comment.id}`);
    const deleteIcon = document.createElement("img");
    deleteIcon.setAttribute("src", "images/icon-delete.svg");
    deleteIcon.setAttribute("alt", "delete icon");
    deleteIcon.setAttribute("id", `delete-icon_${comment.id}`);
    deleteIcon.classList.add("delete-icon");
    const deleteText = document.createElement("p");
    deleteText.classList.add("delete-text");
    deleteText.setAttribute("id", `delete-text_${comment.id}`);
    deleteText.innerText = "Delete";
    deleteRow.append(deleteIcon, deleteText);
    const editRow = createContainer("div", ["edit-row"]);
    editRow.setAttribute("id", `edit-row_${comment.id}`);
    const editIcon = document.createElement("img");
    editIcon.setAttribute("src", "images/icon-edit.svg");
    editIcon.setAttribute("alt", "edit icon");
    editIcon.setAttribute("id", `edit-icon_${comment.id}`);
    editIcon.classList.add("edit-icon");
    const editText = document.createElement("p");
    editText.classList.add("edit-text", `edit-button_${comment.id}`);
    editText.setAttribute("id", `edit-text_${comment.id}`);
    editText.innerText = "Edit";
    editRow.append(editIcon, editText);
    editOrDeleteRow.append(deleteRow, editRow);
    userButtonsContainer.append(editOrDeleteRow);
  } else {
    const replyButtonRow = setReplyButton(comment);
    userButtonsContainer.append(replyButtonRow);
  }
  return userButtonsContainer;
}

function createContainer(typeOfElement, addTheseClasses) {
  const container = document.createElement(typeOfElement);
  addTheseClasses.forEach((thisClass) => {
    container.classList.add(thisClass);
  });
  return container;
}

function setReplyButton(comment) {
  const replyButtonContainer = createContainer("div", ["reply-row"]);
  replyButtonContainer.setAttribute("id", `reply-row_${comment.id}`);
  const replyImg = document.createElement("img");
  replyImg.setAttribute("src", "images/icon-reply.svg");
  replyImg.setAttribute("alt", "reply icon");
  replyImg.classList.add("reply-img");
  replyImg.setAttribute("id", `reply-icon_${comment.id}`);
  const replyText = document.createElement("p");
  replyText.innerText = "Reply";
  replyText.classList.add("reply-text");
  replyText.setAttribute("id", `reply-text_${comment.id}`);
  replyButtonContainer.append(replyImg, replyText);
  return replyButtonContainer;
}

//// functions to handle data from localStorage  ///////

function storeCommentsToLocalStorage(commentsArray) {
  const key = `commentsToDisplay`;
  const stringifiedCommentArray = JSON.stringify(commentsArray);
  localStorage.setItem(key, stringifiedCommentArray);
  location.reload();
}

function retrieveCommentsFromLocalStorage() {
  if (localStorage.length > 0) {
    const val = localStorage.getItem("commentsToDisplay");
    const localStorageComments = JSON.parse(val);
    return localStorageComments;
  }
  return [];
}

function aggregateStoredComments(locallyStoredCommentsArray) {
  locallyStoredCommentsArray.forEach((comment) => {
    if (comment.parentId) {
      handleRenderingReplies(comment);
    } else {
      data.comments.push(comment);
    }
  });
}

function handleRenderingReplies(comment) {
  const parentComment = data.comments.find((parent) => {
    return parent.id === Number(comment.parentId);
  });
  parentComment.replies.push(comment);
}

////// helper functions //////

function findCommentNumber(event) {
  console.log(event);
  let commentNumber;
  const idNum = event.target.getAttribute("id");
  for (const char of idNum) {
    const commentIndex = idNum.indexOf("_");
    commentNumber = idNum.slice(commentIndex + 1);
  }
  return commentNumber;
}

function create_UUID() {
  let dt = new Date().getTime();
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function establishOldDate(year, month, day) {
  const date = new Date(year, month, day);
  const readableDate = date.toDateString();
  return readableDate;
}

function findClickedUserComment(targetedComment, commentsArray) {
  const commentNumber = findCommentNumber(targetedComment);
  const correctCommentIndex = commentsArray.findIndex((comment) => {
    return comment.id.toString() === commentNumber;
  });
  return correctCommentIndex;
}

function fadeBackgroundInOut() {
  const commentContainers = document.querySelectorAll(".comment-container");
  const replyContainers = document.querySelectorAll(".replies-container");
  const upvoteContainers = document.querySelectorAll(".upvote-container");
  const submitCommentFields = document.querySelectorAll(
    ".submit-comment-field"
  );
  document.body.classList.toggle("dark-blur");
  mainContainer.classList.toggle("dark-blur");
  commentContainers.forEach((commentContainer) => {
    commentContainer.classList.toggle("light-blur");
  });
  replyContainers.forEach((repliesContainer) => {
    repliesContainer.classList.toggle("light-blur");
  });
  upvoteContainers.forEach((upvoteContainer) => {
    upvoteContainer.classList.toggle("light-blur");
  });
  submitCommentFields.forEach((field) => {
    field.classList.toggle("light-blur");
  });
}
