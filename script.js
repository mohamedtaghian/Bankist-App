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
    '2024-01-18T21:31:17.178Z',
    '2024-02-23T07:42:02.383Z',
    '2024-03-28T09:15:04.904Z',
    '2024-04-01T10:17:24.185Z',
    '2024-05-08T14:11:59.604Z',
    '2025-01-23T17:01:17.194Z',
    '2025-01-26T23:36:17.929Z',
    '2025-01-29T10:51:36.790Z',
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
    '2024-01-01T13:15:33.035Z',
    '2024-01-30T09:48:16.867Z',
    '2024-02-25T06:04:23.907Z',
    '2024-03-25T14:18:46.235Z',
    '2024-05-05T16:33:06.386Z',
    '2025-01-23T14:43:26.374Z',
    '2025-01-25T18:49:59.371Z',
    '2025-01-26T12:01:20.894Z',
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
// Testing

// Date format function
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// Number format function
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Display movements in UI
const displayMovements = function (account, sort = false) {
  // Clear HTML
  containerMovements.innerHTML = '';

  const combinedMovsDates = account.movements.map((mov, i) => ({
    movement: mov,
    movementDate: account.movementsDates.at(i),
  }));

  if (sort) {
    combinedMovsDates.sort((a, b) => a.movement - b.movement);
  }

  combinedMovsDates.forEach(function (obj, i) {
    const { movement, movementDate } = obj;
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const displayDate = formatMovementDate(
      new Date(movementDate),
      account.locale
    );

    const formattedMov = formatCur(movement, account.locale, account.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>    
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    // Insert html template
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Calculating AND display balance
const calcDisplayBalance = function (account) {
  // Adding balance property to account
  account.balance = account.movements.reduce(function (acc, cur) {
    return acc + cur;
  }, 0);

  // Display balance
  labelBalance.textContent = formatCur(
    account.balance,
    account.locale,
    account.currency
  );
};

// Calculate summary AND display interest
const calcDisplaySummary = function (account) {
  const deposit = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, dep) => acc + dep, 0);
  // Display income
  labelSumIn.textContent = formatCur(deposit, account.locale, account.currency);

  const withdrawls = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, wit) => acc + wit, 0);
  // Display outcome
  labelSumOut.textContent = formatCur(
    Math.abs(withdrawls),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(dep => (dep * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  // Display interest
  labelSumInterest.textContent = formatCur(
    interest,
    account.locale,
    account.currency
  );
};

// Add username property for each account
const computeUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .trim()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
computeUserName(accounts);

// Update UI
const updateUI = function (account) {
  // Display movements
  displayMovements(account);

  // Display balance
  calcDisplayBalance(account);

  // Display summary
  calcDisplaySummary(account);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = `${Math.trunc(time / 60)}`.padStart(2, '0');
    const sec = `${time % 60}`.padStart(2, '0');

    // in each call, print the time remaining
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = '0';
    }
    // Decrease time every second
    time--;
  };
  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Event handler
let currentAcc, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAcc = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAcc?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome
    labelWelcome.textContent = `Welcome back, ${
      currentAcc.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = '1';

    // Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAcc.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    // Start logout timer
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAcc);
  }
});

// Implementing transfer
btnTransfer.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAcc.balance >= amount &&
    receiverAcc?.username !== currentAcc.username
  ) {
    // Adding negative movement to current balance
    currentAcc.movements.push(-amount);

    // Adding positive movement to other account
    receiverAcc?.movements.push(amount);

    // Add transfer date
    currentAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAcc);
  }

  // Clear input fields
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  inputTransferAmount.blur();

  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

// Request loan
btnLoan.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  const loanValue = Math.floor(inputLoanAmount.value);

  if (
    loanValue > 0 &&
    currentAcc.movements.some(mov => mov >= loanValue * 0.1)
  ) {
    setTimeout(function () {
      // Add loan to movements
      currentAcc.movements.push(loanValue);

      // Add loan date
      currentAcc.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAcc);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Remove account
btnClose.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAcc.username &&
    Number(inputClosePin.value) === currentAcc.pin
  ) {
    const removeAccountIndex = accounts.findIndex(
      acc => acc.username === currentAcc.username
    );

    // Delete account
    accounts.splice(removeAccountIndex, 1);

    // Hide the UI
    containerApp.style.opacity = '0';
  }

  // Clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

// Sort movements
// sort state variable
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAcc, !sorted);
  // flipping sort variable each time
  sorted = !sorted;
});
// Testings

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// setInterval(() => {
//   const now = new Intl.DateTimeFormat('en-US', {
//     hour: 'numeric',
//     minute: 'numeric',
//   }).format(new Date());
//   console.log(now);
// }, 1000 * 5);
