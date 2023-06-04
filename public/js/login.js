/* eslint-disable */

import axios = require('axios');
import '@babel/polyfill';
import {showAlert} from './alerts'

export const login = async (email, password) => {
  console.log(email, password);

  try {
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
    showAlert('The email or password is incorrect!', err.response.data.message);
    // console.log(err.response.data.message);
    console.log(err.response.data);
  }
};
