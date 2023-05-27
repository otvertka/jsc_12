'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2023-02-08T14:11:59.604Z',
    '2023-02-14T17:01:17.194Z',
    '2023-02-15T23:36:17.929Z',
    '2023-02-16T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const now = new Date();
  // const day = `${date.getDate()}`.padStart(2, 0); // дата начинается с 01 (2 - колич. цифр, 0 - начало отсчёта)
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); // месяц начинается с 01 (2 - колич. цифр, 0 - начало отсчёта)
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};
// функция конверитрования валюты пользователя
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}: ${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      // Display UI and message
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    // Decrese 1 second
    time--;
  };

  //Set time to 5 minutes
  let time = 30;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // Experimenting API

    // const locale = navigator.language; // считывает язык браузера пользователя
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now); // ПЕреводим в формат страны
    // const day = `${now.getDate()}`.padStart(2, 0); // дата начинается с 01 (2 - колич. цифр, 0 - начало отсчёта)
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); // месяц начинается с 01 (2 - колич. цифр, 0 - начало отсчёта)
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}: ${min}`;
    // day/month/year

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString()); // добавляем текущую дату в поле транзакций
    receiverAcc.movementsDates.push(new Date().toISOString()); // добавляем текущую дату в поле транзакций

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //  добавляем текущую дату в поле кредитов
      currentAccount.movementsDates.push(new Date().toISOString()); // добавляем текущую дату в поле транзакций

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES #1 Converting and Checking Numbers

console.log(23 === 23.0); // true
// Base 10 - 0 to 9
// Binary base 2 - 0 1
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

console.log(Number('23')); // 23
console.log(+'23'); // 23

// Parsing   Метод Number.parseInt() разбирает строковый аргумент и возвращает целое число. Этот метод ведёт себя идентично глобальной функции parseInt() и является частью ECMAScript 6 (его целью является модуляризация глобальных сущностей).
console.log(Number.parseInt('30px')); //30
// Метод Number.parseFloat() разбирает строковый аргумент и возвращает число с плавающей запятой.
console.log(Number.parseInt(' 2.5rem')); // 2
console.log(Number.parseFloat(' 2.5rem')); // 2.5

// console.log(parseFloat(' 2.5rem')); // 2.5

// Метод Number.isNaN() определяет, является ли переданное значение NaN. Это более надёжная версия оригинальной глобальной функции isNaN().
// Проверка, на значение is NaN
console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // Infinity// false

// Метод Number.isFinite() определяет, является ли переданное значение конечным числом.
// Проверка, это число или нет
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false , т.к. это строка
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false ,  т.к. это Infinity

// Метод Number.isInteger() определяет, является ли переданное значение целым числом.
console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // Infinity// false

/// LECT Math and Rounding
console.log(Math.sqrt(25)); // 5
console.log(25 ** (1 / 2)); // 5
console.log(8 ** (1 / 3)); // 2  кубический корень из 8 = 2

console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN

console.log(Math.min(5, 18, 23, 11, 2)); // 2

console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.1592653589793 . Считаем площадь круга, радиусом 10px

console.log(Math.trunc(Math.random() * 6) + 1); // Сгенерировать произвольные числа от 1- 5
// Функция генерирования случайных чисел в диапазоне мин - макс
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min... max
console.log(randomInt(-10, 20));

// Округление целых чисел
console.log(Math.trunc(23)); // 23

console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); // 24

console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9)); // 24

console.log(Math.floor(23.3)); // 23
console.log(Math.floor('23.9')); // 23

console.log(Math.trunc(-23.3)); // - 23
console.log(Math.floor(-23.3)); // -24

// Округление десятичных чисел
console.log((2.7).toFixed(0)); // 3 возвращает СТРОКУ 3
console.log((2.7).toFixed(3)); // 2.700 возвращает СТРОКУ 3
console.log((2.345).toFixed(2)); // 2.35 возвращает СТРОКУ
console.log(+(2.345).toFixed(2)); // 2.35 возвращает ЧИСЛО

// LECT The Remainder Operator. Остаток от деления
console.log(5 % 2); // 1
console.log(8 % 3); // 2

console.log(6 % 2); // 0

const isEven = n => n % 2 === 0;
console.log(isEven(8)); // true
console.log(isEven(23)); // false
console.log(isEven(514)); // true

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0 , 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = ' orangered'; //
    // 0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = ' blue';
  });
});

// LECT . Numeric Separators . числовые разделители
// 287,460,000,000
// const diametr = 287_460_000_000;
// console.log(diametr); // 287460000000

// const priceCents = 345_99;
// console.log(priceCents); // 34599

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;

// const PI = 3.1415;
// console.log(PI); /// 3.1415

// console.log(Number('230_000')); // NaN
// console.log(parseInt('230_000')); // 230

// //  LECT . Working with BigInt. BigInt – это специальный числовой тип, который предоставляет возможность работать с целыми числами произвольной длины. Чтобы создать значение типа BigInt, необходимо добавить n в конец числового литерала или вызвать функцию BigInt, которая создаст число типа BigInt из переданного аргумента. Аргументом может быть число, строка и др.
// console.log(2 ** 53 - 1); // 9007199254740991
// console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
// console.log(2 ** 53 + 1); // 9007199254740992
// console.log(2 ** 53 + 2); // 9007199254740994
// console.log(2 ** 53 + 3); // 9007199254740996
// console.log(2 ** 53 + 4); // 9007199254740996

// console.log(4932423432434234234234234234324234234234n);
// console.log(BigInt(49324));

// // Operations
// console.log(10000n + 10000n); // 20000n
// console.log(365435435345345435345345345435345n * 10000000n); // 3654354353453454353453453454353450000000n

// // const huge = 20289830233434343434n;
// // // const num = 23;
// // // console.log(huge * num); // Ошибка. т.к. нельзя смешивать BigInt  другими типами
// // console.log(huge * BigInt(num)); // После конвертации будет работать 466666095368989898982n

// // Исключения
// console.log(20n > 15); // true
// console.log(20n === 20); // false , т.к. разные типы
// console.log(typeof 20n); // bigint
// console.log(20n == '20'); // true

// //
// console.log(huge + ' is REALLY big !! ');

// // Divisions.
// console.log(11n / 3n); // 3n
// console.log(10 / 3); // 3.3333333333333335

// LECT Creating Dates
// Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('Thu Feb 16 2023 15:12:06'));
// console.log(new Date('December 24, 2015'));
// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5));
// console.log(new Date(2037, 10, 31)); // Tue Dec 01 , а не ноябрь

// console.log(new Date(0)); // Thu Jan 01 1970 03:00:00
// console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Sun Jan 04 1970 03:00:00

// Working with Dates
// const future = new Date(2037, 10, 19, 15, 23, 5);
// console.log(future);
// console.log(future.getFullYear()); // 2037
// console.log(future.getMonth()); // 10
// console.log(future.getDay()); // 4
// console.log(future.getHours()); // 15
// console.log(future.getMinutes()); // 23
// console.log(future.getSeconds()); // 5
// console.log(future.toISOString()); // 2037-11-19T13:23:05.000Z
// console.log(future.getTime());

// console.log(new Date(2142249785000)); // Thu Nov 19 2037 15:23:05 GMT+0200 (Восточная Европа, стандартное время)

// console.log(Date.now()); // 1676554023559

// future.setFullYear(2040);
// console.log(future); // Mon Nov 19 2040 15:23:05 GMT+0200 (Восточная Европа, стандартное время)

// LECT Operations With Dates
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(+future);

const cacDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = cacDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);

// LECT Internationalizing Numbers (Intl)
const num = 38847423.23;
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false, // убирает разделители в цифре
};
console.log('US:     ', new Intl.NumberFormat('en-US', options).format(num)); // US:      38,847,423.23
console.log(
  'Germany:     ',
  new Intl.NumberFormat('de-DE', options).format(num)
); //  Germany:      38.847.423,23
console.log('Syria:     ', new Intl.NumberFormat('ar-SY', options).format(num)); //  Syria:      ٣٨٬٨٤٧٬٤٢٣٫٢٣
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
); // ru 38 847 423,23

// LECT  setTimeout and setInterval
//setTimeout
const ingredients = ['olives', 'spinach', 'tuna'];
const pizzaTimer = setTimeout(
  (ing1, ing2, ing3) =>
    console.log(`Here is your pizza with ${ingredients} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer); // если есть такой ингредиент, то очистить вызов

// setInterval  // каждую секунду
setInterval(function () {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const sec = now.getSeconds();
  // console.log(hours, minutes, sec);
}, 1000);
