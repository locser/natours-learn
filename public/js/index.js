/* eslint-disable */

import { login } from './login';
import '@babel/polyfill';

//values

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
