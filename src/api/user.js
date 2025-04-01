import request from "@/utils/request";

export function login(data) {
  return request({
    url: "/token/",
    method: "post",
    data
  });
}

export function logout() {
  return request({
    url: "/token/black/",
    method: "get"
  });
}

export function getInfo() {
  return request({
    url: "/system/user/info/",
    method: "get"
  });
}

export function getUserList(query) {
  return request({
    url: "/system/user/",
    method: "get",
    params: query
  });
}

export function getUser(id) {
  return request({
    url: `/system/user/${id}/`,
    method: "get"
  });
}

export function createUser(data) {
  return request({
    url: "/system/user/",
    method: "post",
    data
  });
}

export function updateUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: "put",
    data
  });
}

export function deleteUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: "delete",
    data
  });
}

export function changePassword(data) {
  return request({
    url: "/system/user/password/",
    method: "put",
    data
  });
}

// 發送驗證碼
export function sendVerificationCode(data) {
  return request({
    url: "/system/reset-password/send-code/",
    method: "post",
    params: data
  });
}

// 驗證驗證碼
export function verifyCode(data) {
  return request({
    url: "/system/reset-password/verify-code/",
    method: "post",
    data
  });
}

// 重設密碼
export function resetPassword(data) {
  return request({
    url: "/system/user/reset/",
    method: "post",
    data
  });
}
