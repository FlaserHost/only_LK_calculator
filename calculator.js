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
    if (data0_1 === '')
    {
        document.getElementById('kedo-field').value = 300;
        data0_1 = 300;
    }

    if (data1_1 === '')
    {
        document.getElementById('vcep-field').value = 2;
        data1_1 = 2;
    }

    const retailYearD3 = (data0_1 * unepRetail) + (data1_1 * ukepRetail);
    const retailYearD4 = parametrs[data2_1];
    const addition = (retailYearD3 + retailYearD4) * discountCoefficient;

    const summaFastStart = Math.round(addition / 12);
    const summaFastStartFormatted = summaFastStart.toLocaleString();
    const summaExtendedFormatted = (summaFastStart + 13708).toLocaleString(); // 164500 / 12 = 13 708.33333333

    return [summaFastStartFormatted, summaExtendedFormatted];
}

document.getElementById('calculate-btn').addEventListener('click', e => {
    e.preventDefault();
    const calculateForm = document.getElementById('new-calculator-form');
    const calculateData = [...new FormData(calculateForm)]; // аналогично как Array.from(new FormData(calculateForm))

    // для расчета скидки
    const fivePercent = (calculateData[0][1] * 5 / 100) === +calculateData[2][1]; // если совпало так, что право это 5% от лево
    // конец расчета
    const fastStart = document.querySelectorAll('.fast-start');
    const discount = document.querySelectorAll('.price-after-discount');

    if (discount.length)
    {
        discount.forEach(item => item.remove());
        fastStart.forEach(item => item.classList.remove('discount-old-price'));
    }

    let summaFastStartFormatted;
    let summaFastStartFormattedDiscount;
    let summaExtendedFormatted;

    const result = calculation(calculateData[0][1], calculateData[1][1], calculateData[2][1], 1);
    summaFastStartFormatted = result[0];
    summaExtendedFormatted = result[1];

    if (fivePercent) {
        const prices = document.querySelectorAll('.prices');

        const resultDiscount = calculation(calculateData[0][1], 0, calculateData[2][1], 0.6);
        summaFastStartFormattedDiscount = resultDiscount[0];

        const newPrice = `<div class="price-after-discount">
                    <span class="discount-new-price">${summaFastStartFormattedDiscount} руб</span>
                    <div class="discount-deadline">Срок действия акции до 01.09.2023</div>
             </div>`;

        fastStart.forEach(item => item.classList.add('discount-old-price'));
        prices.forEach(item => item.insertAdjacentHTML('afterbegin', newPrice));
    }

    fastStart.forEach(item => item.innerHTML = `${summaFastStartFormatted} руб`);
    document.querySelectorAll('.extended').forEach(item => item.innerHTML = `${summaExtendedFormatted} руб`);
});
