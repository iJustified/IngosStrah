; (function () {
   'use strict';

   class Form {
      // паттерны RegExp о которых было написано выше
      static patternName = /^[а-яёА-ЯЁ]+ [а-яёА-ЯЁ]+ [а-яёА-ЯЁ]*$/;
      static patternMail = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z])+$/;
      static patternPhone = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
      // массив с сообщениями об ошибке
      // эти сообщения можно разместить и внутри кода валидации, но лучше,
      // если они будут находиться в одном месте
      // это облегчит их редактирование, а так же проще будет прописать новые,
      // если решите добавить критерии валидации
      static errorMess = [
         'Заполните поле', // 0
         'Проверьте поле на правильность заполения', // 1
         'Номер не найден', // 2
         'Почта не найдена' // 3
         // 'Укажите тему сообщения', // 4
         // 'Напишите текст сообщения' // 5
      ];

      constructor(form) {
         this.form = form;
         // коллекция полей формы из которой мы будем извлекать данные
         this.fields = this.form.querySelectorAll('.form-control');
         // объект кнопки, на который повесим обработчик события начала валидации формы
         // и отправки её значений на сервер
         this.btn = this.form.querySelector('[type=submit]');
         this.checkBox = document.querySelector('[type=checkbox]');
         this.popup = document.querySelector('.classPopup');
         // флаг ошибки валидации
         this.iserror = false;
         // регистрируем обработчики событий
         this.registerEventsHandler();
      }

      static getElement(el) {
         // получение элемента, в который будет выводиться
         // текст ошибки
         return el.parentElement.nextElementSibling;
      }

      clickCheckbox() {
         let objectsThis = this;
         this.checkBox.addEventListener('click', function() {
            (this.value === 'yes') ? this.value = 'no' : this.value = 'yes';
            objectsThis.addClassSubmit();
         })
      }

      registerEventsHandler() {
         // this.form.clickCheckbox();
         // запуск валидации при отправке формы
         // this.validForm.bind(this);
         // this.validBlurField.bind(this)
         this.clickCheckbox();
         this.btn.addEventListener('click', this.validForm.bind(this));
         // очистка ошибок при фокусе поля ввода
         this.form.addEventListener('focus', () => {
            // находим активный элемент формы
            const el = document.activeElement;
            // если этот элемент не <button type="submit">,
            // вызываем функцию очистки <span class="error"> от текста ошибки
            if (el === this.btn) return;
            this.cleanError(el);
         }, true);
         // запуск валидации поля ввода при потере им фокуса
         for (let field of this.fields) {
            field.addEventListener('blur', this.validBlurField.bind(this));
         }
      }

      validForm(e) {
         // отменяем действие браузера по умолчания при клике по
         // кнопке формы <button type="submit">, чтобы не происходило обновление страницы
         e.preventDefault();
         // объект представляющий данные HTML формы
         const formData = new FormData(this.form);
         // объявим переменную error, в которую будем записывать текст ошибки
         let error;

         // перебираем свойства объекта с данными формы
         for (let property of formData.keys()) {
            // вызываем функцию, которая будет сравнивать
            // значение свойства с паттерном RegExp и возвращать результат
            // сравнения в виде пустой строки или текста ошибки валидации
            error = this.getError(formData, property);
            if (error.length == 0) continue;
            // устанавливаем флаг наличия ошибки валидации
            this.iserror = true;
            // выводим сообщение об ошибке
            this.showError(property, error);
         }


         console.log(this.checkBox);
         if (this.iserror) return;
         // вызываем функцию отправляющую данные формы,
         // хранящиеся в объекте formData, на сервер
         if (this.checkBox.value === 'yes') this.sendFormData(formData);
      }

      validBlurField(e) {
         const target = e.target;
         // имя поля ввода потерявшего фокус
         const property = target.getAttribute('name');
         // значение поля ввода
         const value = target.value;

         // создаём пустой объект и записываем в него
         // данные в формате 'имя_поля': 'значение', полученные
         // от поля ввода потерявшего фокус
         const formData = new FormData();
         formData.append(property, value);

         // запускаем валидацию поля ввода потерявшего фокус
         const error = this.getError(formData, property);
         if (error.length == 0) return;
         // выводим текст ошибки
         this.showError(property, error);
      }

      getError(formData, property) {
         console.log('geterror');
         let error = '';
         // создаём литеральный объект validate
         // каждому свойству литерального объекта соответствует анонимная функция, в которой
         // длина значения поля, у которого атрибут 'name' равен 'property', сравнивается с 0,
         // а само значение - с соответствующим паттерном
         // если сравнение истинно, то переменной error присваивается текст ошибки
         const validate = {
            username: () => {
               if (formData.get('username').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternName.test(formData.get('username')) == false) {
                  error = Form.errorMess[1];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            },
            usermail: () => {
               if (formData.get('usermail').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternMail.test(formData.get('usermail')) == false) {
                  error = Form.errorMess[3];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            },
            userphone: () => {
               if (formData.get('userphone').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternPhone.test(formData.get('userphone')) == false) {
                  error = Form.errorMess[2];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            }
         }

         if (property in validate) {
            // если после вызова анонимной функции validate[property]() переменной error
            // было присвоено какое-то значение, то это значение и возвращаем,
            // в противном случае значение error не изменится
            validate[property]();
         }
         return error;
      }

      showError(property, error) {
         // получаем объект элемента, в который введены ошибочные данные
         const el = this.form.querySelector(`[name=${property}]`);
         // с помощью DOM-навигации находим <span>, в который запишем текст ошибки
         const errorBox = Form.getElement(el);

         el.classList.add('form-control_error');
         // записываем текст ошибки в <span>
         errorBox.innerHTML = error;
         // делаем текст ошибки видимым
         errorBox.style.display = 'block';
      }


      // ! показываем успех
      showSuccess(property) {
         var formElement = document.querySelector('[name=' + property + ']');
         formElement.classList.add('form-control_success');
         this.addClassSubmit();
      }

      cleanSuccess(property) {
         var formElement = document.querySelector('[name=' + property + ']');
         formElement.classList.remove('form-control_success');
         this.addClassSubmit();
      }

      addClassSubmit() {
         let getInputAll = document.querySelectorAll('.form-control_success');
         let sendMess = document.querySelector('#send_mess');
         (getInputAll.length === 3 && this.checkBox.value === 'yes') ? sendMess.classList.add('button_success') : sendMess.classList.remove('button_success');
      }

      cleanError(el) {
         // с помощью DOM-навигации находим <span>, в который записан текст ошибки
         const errorBox = Form.getElement(el);
         el.classList.remove('form-control_error');
         errorBox.removeAttribute('style');
         this.iserror = false;
      }

      closePopup() {

      }

      sendFormData(formData) {
         let xhr = new XMLHttpRequest();
         this.form.popup.classList.add('openPopup');
         // указываем метод передачи данных, адрес php-скрипта, который эти данные
         // будет обрабатывать и способ отправки данных.
         // значение 'true' соответствует асинхронному запросу
         xhr.open('POST', '/sendmail.php', true);
         // xhr.onreadystatechange содержит обработчик события,
         // вызываемый когда происходит событие readystatechange
         xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
               if (xhr.status === 200) {
                  // здесь расположен код вашей callback-функции
                  // например, она может выводить сообщение об успешной отправке письма
                  this.openPopup();
               } else {
                  // здесь расположен код вашей callback-функции
                  // например, она может выводить сообщение об ошибке
               }
            } else {
               // здесь расположен код вашей callback-функции
               // например, она может выводить сообщение об ошибке
            }
         }
         // отправляем данные формы
         xhr.send(formData);
      }
   }

   // коллекция всех HTML форм на странице
   const forms = document.querySelectorAll('[name=feedback]');
   // если формы на странице отсутствуют, то прекращаем работу функции
   if (!forms) return;
   // перебираем полученную коллекцию элементов
   for (let form of forms) {
      // создаём экземпляр формы
      const f = new Form(form);

      // forms[0].addEventListener('keydown', function () {
      //    new Form(form);
      //    this.addClassSubmit()
      // });
   }

})();