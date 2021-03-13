const BASE_URL = "https://jsonplace-univclone.herokuapp.com";

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.error(error);
    });
}

function fetchUsers() {
  return fetchData(`${BASE_URL}/users`);
}

function renderUser(user) {
  return $(`<div class="user-card">
    <header>
      <h2>${user.name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${user.email}</p>
      <p><b>Works for:</b> ${user.company.name}</b></p>
      <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${user.username}</button>
      <button class="load-albums">ALBUMS BY ${user.username}</button>
    </footer>
  </div>`).data("user", user);
}

function renderUserList(userList) {
  const userListHere = $("#user-list");
  userListHere.empty();
  userList.forEach(function (user) {
    userListHere.append(renderUser(user));
  });
}

$("#user-list").on("click", ".user-card .load-posts", function () {
  const user = $(this).closest(".user-card").data("user");
  fetchUserPosts(user.id).then(renderPostList);
});

$("#user-list").on("click", ".user-card .load-albums", function () {
  const user = $(this).closest(".user-card").data("user");
  fetchUserAlbumList(user.id).then(renderAlbumList);
});

function fetchUserAlbumList(userId) {
  return fetchData(
    `${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`
  );
}

function renderAlbum(album) {
  const albumHere = $(`<div class="album-card">
    <header>
      <h3>${album.title}, by ${album.user.username} </h3>
    </header>
    <section class="photo-list"></section>
  </div>`);
  const photoListHere = albumHere.find(".photo-list");
  album.photos.forEach(function (photo) {
    photoListHere.append(renderPhoto(photo));
  });
  return albumHere;
}

function renderPhoto(photo) {
  return $(`<div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}" />
      <figure>${photo.title}</figure>
    </a>
  </div>`);
}

function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");
  const albumListHere = $("#album-list");
  albumListHere.empty().addClass("active");
  albumList.forEach(function (album) {
    albumListHere.append(renderAlbum(album));
  });
}

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null);
  }

  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments;
    return post;
  });
}

function renderPost(post) {
  return $(`<div class="post-card">
    <header>
      <h3>${post.title}</h3>
      <h3>--- ${post.user.username}</h3>
    </header>
    <p>${post.body}</p>
    <footer>
      <div class="comment-list"></div>
      <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
    </footer>
  </div>`).data("post", post);
}

function renderPostList(postList) {
  $("#app section.active").removeClass("active");
  const postListHere = $("#post-list");
  postListHere.empty().addClass("active");
  postList.forEach(function (post) {
    postListHere.append(renderPost(post));
  });
}

function toggleComments(postCardElement) {
  const footerHere = postCardElement.find("footer");
  if (footerHere.hasClass("comments-open")) {
    footerHere.removeClass("comments-open");
    footerHere.find(".verb").text("show");
  } else {
    footerHere.addClass("comments-open");
    footerHere.find(".verb").text("hide");
  }
}

$("#post-list").on("click", ".post-card .toggle-comments", function () {
  const postCardElement = $(this).closest(".post-card");
  const post = postCardElement.data("post");
  const commentListHere = postCardElement.find(".comment-list");
  setCommentsOnPost(post)
    .then(function (post) {
      console.log("building comments for the first time...");
      commentListHere.empty();
      post.comments.forEach(function (comment) {
        commentListHere.prepend(
          $(`<h3>${comment.body} --- ${comment.email}</h3>`)
        );
      });
      toggleComments(postCardElement);
    })
    .catch(function () {
      console.log("comments previously existed, only toggling...");
      toggleComments(postCardElement);
    });
});

function bootstrap() {
  fetchUsers().then(renderUserList);
}

bootstrap();
