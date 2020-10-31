(function () {
  'use strict'

    const menuSwitcher = document.querySelector('.header__menu-switcher');
    const headerNavUser = document.querySelector('.header__nav-user');

    menuSwitcher.addEventListener('click', function () {
        menuSwitcher.classList.toggle('header__menu-switcher--opened');
        headerNavUser.classList.toggle('header__nav-user--opened');
    })
})();
