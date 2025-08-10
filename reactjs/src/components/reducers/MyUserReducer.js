import Cookies from "js-cookie";

export default (current, action) => {
  switch (action.type) {
    case "login":
      return { ...action.payload }; // cần tạo object mới
    case "logout":
      Cookies.remove("token");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      return null;
    default:
      return current;
  }
};
