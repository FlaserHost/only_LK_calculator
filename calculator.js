// треугольники регулировщики
const triangles = document.querySelectorAll('.triangle-btn');

triangles.forEach(triangle => {
    triangle.addEventListener('click', e => {
        const currentProperty = e.target.getAttribute('data-property');
        const closestInput = e.target.closest('.input-place').querySelector('.form-field');
        const closestInputID = closestInput.getAttribute('id');
        let closestInputValue = +closestInput.value;
        let limit = closestInputID === 'kedo-field' ? 30000 : 100;

        currentProperty === 'up' ? closestInputValue++ : closestInputValue--;

        if (closestInputValue > limit)
        {
            closestInputValue = limit;
        }
        else if (closestInputValue < 0)
        {
            closestInputValue = 0;
        }

        closestInput.value = closestInputValue;
    });
});

// ограничение числовых полей
const numberFields = document.querySelectorAll('.new-calculator-form input.form-field');
numberFields.forEach(field => field.addEventListener('input', e => {
    const thisField = e.target.getAttribute('id');
    const limit = thisField === 'kedo-field' ? 30000 : 100;
    e.target.value = e.target.value <= limit ? +e.target.value : limit;
}));
numberFields.forEach(field => {
    field.addEventListener('blur', e => {
        if (e.target.value === '0')
        {
            e.target.value = '';
            e.target.focus();
            e.target.blur();
        }
    })
});

// события прокрутки
const rates = document.querySelector('.rates-outer-block').offsetTop * -1;
document.addEventListener('scroll', e => {
    const scrollWindow = e.target.body.getBoundingClientRect().top;
    const tableHeader = document.querySelector('.rates-wrapper');

    scrollWindow <= rates
        ? tableHeader.classList.add('fixed-header-bg-color')
        : tableHeader.classList.remove('fixed-header-bg-color');
});

// показать все функции
document.getElementById('show-functionality-btn').addEventListener('click', btn => {
    let currentBtnText = btn.target.innerText.toLowerCase();
    const functionsWindow = document.querySelector('.functions-window');
    const mistBlock = document.querySelector('.actions-place')
    const functionsWindowStyle = functionsWindow.style;
    const fullTableHeight = document.querySelector('.functions-window__table-place').getBoundingClientRect().height + 40;
    functionsWindowStyle.height = `${fullTableHeight}px`;

    if (currentBtnText === 'показать функционал')
    {
        mistBlock.classList.remove('mist');
        currentBtnText = 'скрыть функционал';
    }
    else
    {
        document.querySelector('html').scroll({top: (rates * -1) - 200, behavior: 'smooth'});
        functionsWindowStyle.height = '370px';
        mistBlock.classList.add('mist');
        currentBtnText = 'показать функционал';
    }

    btn.target.innerText = currentBtnText;
});

// логика рассчета
const unepRetail = 560; // B20
const ukepRetail = 1800; // B21
const parametrs = { // A23 и ниже
    5: 131100,
    10: 176316,
    20: 296196,
    50: 568836,
    100: 863460,
    200: 1726920,
    300: 2590380
};

const calculation = (data0_1, data1_1, data2_1, discountCoefficient) => {
    if (data0_1 === '') {
        document.getElementById('kedo-field').value = 300;
        data0_1 = 300;
    }

    if (data1_1 === '') {
        document.getElementById('vcep-field').value = 2;
        data1_1 = 2;
    }

    const retailYearD3 = (data0_1 * unepRetail) + (data1_1 * ukepRetail);
    const retailYearD4 = parametrs[data2_1];
    const fullFastStart = retailYearD3 + retailYearD4; // полная цена СТАРТ без скидки
    const summaFastStart = Math.round(fullFastStart / 12); // полная цена СТАРТ без скидки за месяц
    const addition = Math.round(summaFastStart * discountCoefficient); // discountCoefficient% от стоимости СТАРТ

    const summaFastStartFormatted = summaFastStart.toLocaleString();
    const summaFastStartDiscountFormatted = (summaFastStart - addition).toLocaleString();
    const summaExtended = summaFastStart + 13708; // 164500 / 12 = 13 708.33333333
    const extendedAddition = Math.round(summaExtended * discountCoefficient);
    const summaExtendedFormatted = summaExtended.toLocaleString();
    const summaExtendedDiscountFormatted = (summaExtended - extendedAddition).toLocaleString();

    return [summaFastStartFormatted, summaExtendedFormatted, summaFastStartDiscountFormatted, summaExtendedDiscountFormatted];
}

const discountData = document.querySelectorAll('.discount-field');
const discountPercent = discountData[0].value;
const discountTime = discountData[1].value;

const date = new Date();
const year = date.getFullYear();
const month = (date.getMonth() + 1).toString().padStart(2, '0');
const day = date.getDate().toString().padStart(2, '0');
const today = `${year}-${month}-${day}`;

const discountDateParts = discountTime.split('.');
const discountDateUS = `${discountDateParts[2]}-${discountDateParts[1]}-${discountDateParts[0]}`;
const currentDate = new Date(today);
const discountDate = new Date(discountDateUS);

let discountExist = false;

if (discountPercent > 0) {
    discountExist = currentDate <= discountDate;
}

const calculateForm = document.getElementById('new-calculator-form');
const calculateBtn = document.getElementById('calculate-btn');
calculateBtn.addEventListener('click', e => {
    e.preventDefault();

    const calculateData = [...new FormData(calculateForm)]; // аналогично как Array.from(new FormData(calculateForm))

    const ratesPrices = document.querySelectorAll('.prices .discount');
    const discount = document.querySelectorAll('.price-after-discount');

    if (discount.length) {
        discount.forEach(item => item.remove());
        ratesPrices.forEach(item => item.classList.remove('discount-old-price'));
    }

    const result = calculation(calculateData[2][1], calculateData[3][1], calculateData[4][1], !discountExist ? 1 : discountPercent / 100);
    const summaFastStartFormatted = result[0];
    const summaExtendedFormatted = result[1];
    const summaFastStartDiscountFormatted = result[2];
    const summaExtendedDiscountFormatted = result[3];

    if (discountExist) {
        const prices = document.querySelectorAll('.prices');

        const resultsArray = [summaFastStartDiscountFormatted, summaExtendedDiscountFormatted].map(item => `<div class="price-after-discount">
                    <span class="discount-new-price">${item} руб</span>
                    <div class="discount-deadline">Срок действия акции до ${discountTime}</div>
             </div>`);

        ratesPrices.forEach(item => item.classList.add('discount-old-price'));

        let counter = 0;
        prices.forEach(item => {
            item.insertAdjacentHTML('afterbegin', resultsArray[counter]);
            counter = counter !== resultsArray.length - 1 ? ++counter : 0;
        });
    }

    ratesPrices.forEach(item => item.innerHTML = `${summaFastStartFormatted} руб`);
    document.querySelectorAll('.extended').forEach(item => item.innerHTML = `${summaExtendedFormatted} руб`);
});

document.addEventListener('DOMContentLoaded', () => {
    calculateBtn.click();
    setTimeout(() => {
        const inputs = document.querySelectorAll('.field-area:not(:last-child) .form-field');
        inputs.forEach(item => item.value = '');
    }, 100);
});
