/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    console.log(email, password);

    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log(res);

    //you can test with: "email": "user@example.com", -"password": "test1234"
  } catch (err) {
    //error - Login failed
    showAlert('error', err.response.data.message);
    // console.log(err.response.data.message);
    console.log(err.response.data);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      location.reload(true); // reload the current page
    }
  } catch (error) {
    //error - Logout failed
    console.log(error.response.data);
    showAlert('error', 'Could not log out! Please try again');
  }
};

// res.cookie là phương thức được cung cấp bởi Express để đặt cookie trong phản hồi HTTP. Nó được sử dụng để đặt giá trị của cookie với tên và giá trị xác định.

// Đối số đầu tiên của res.cookie là tên của cookie, trong trường hợp này là 'jwt'.

// Đối số thứ hai là giá trị của cookie, trong trường hợp này là 'loggedout'. Giá trị này cho biết rằng người dùng đã đăng xuất.
