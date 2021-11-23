function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getTooltipInfo(colors, columns, stepY, y0, height) {
    const tooltipInfo = {};
    colors.forEach(color=>{
        columns.forEach(col => {
            if (!tooltipInfo[col.name]) {
                tooltipInfo[col.name] = [];
            }
            if (col.name === color.name) {
                tooltipInfo[col.name].push(color);
            }
        })
    });

    const resultInfo = {};

    for (const key in tooltipInfo) {
        const pointsArray = tooltipInfo[key];
        if (!pointsArray.length) continue;
        const result = tooltipInfo[key].reduce((sum, current) => {
            return sum + current.yPosition;
        },0);

        //Y position arithmetic average of all points crossing the vertical line
        const yPos = result / pointsArray.length;
        let y = y0 + (height - y0 - yPos);

        const point = Math.round(y/stepY);

        resultInfo[key] = {
            name: key,
            yPosition: point,
            color: pointsArray[0].color,
        };
    }
    return resultInfo;
}

function formatDate(date) {
    const monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();

    return {
        short: monthNames[monthIndex] + ' ' +  day,
        ms: date,
    };
}

function createTemplate(id1, id2) {

    function createElem(tag, attributes, textContent) {
        const elem = document.createElement(tag);

        for (const key in attributes) {
            elem.setAttribute(key, attributes[key]);
        }
        if (textContent) elem.textContent = textContent;

        return elem;
    }

    function  createHtmlBlock(elems, parent) {
        elems.forEach(elem => {
            parent.appendChild(elem);
        });

        return parent;
    };

    const wrap = createElem('div', { class: 'wrap' });
    const content = createElem('div', { class: 'content' });
    const followers = createElem('div', { class: 'followers' }, 'followers');
    const viewChart = createElem('div', { class: 'viewChart' });
    const lineChart = createElem('div', { class: 'lineChart' });
    const canvasView = createElem('canvas', { class: 'view', id: id1 });
    const canvasLong = createElem('canvas', { class: 'timeLine', id: id2 });
    const sliderElem = createElem('div', { class: 'slider' });

    const dateElem = createElem('div', { class: 'date' }, 'Sat, Feb 24');
    const columnsElem = createElem('div', { class: 'columns' });
    const tooltipElem = createElem('div', { class: 'tooltip' });
    const checkboxes = createElem('div', { class: 'checkboxes' });

    const switchLabel = createElem('div', { class: 'switchLabel' });
    const label = createElem('label');
    const labelText = createElem('span');
    const switcher = createElem('input', { class: 'switcher', type: 'checkbox' });

    const toolTipBlock = createHtmlBlock([dateElem, columnsElem], tooltipElem);
    const viewChartBlock = createHtmlBlock([canvasView, toolTipBlock], viewChart);
    const lineChartBlock = createHtmlBlock([canvasLong, sliderElem], lineChart);
    const contentBlock = createHtmlBlock([followers, viewChartBlock, lineChartBlock, checkboxes], content);
    const labelBlock = createHtmlBlock([labelText, switcher], label);
    const switchLabelBlock = createHtmlBlock([labelBlock], switchLabel);
    const wrapBlock = createHtmlBlock([ contentBlock, switchLabelBlock], wrap);

    document.querySelector('.loadWrap').style.display = 'none';
    return {
        wrap,
        content,
        viewChart,
        lineChart,
        canvasView,
        canvasLong,
        sliderElem,
        dateElem,
        columnsElem,
        tooltipElem,
        checkboxes,

        switchLabel,
        label,
        labelText,
        switcher,
        wrapBlock,
    };
}

function createCheckbox(name, idx, config, onChange, parent, color) {
    const checkbox = document.createElement('input');
    const div = document.createElement('div');
    const label = document.createElement('label');
    const text = document.createTextNode(name);
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = true;
    checkbox.style.display = 'none';
    checkbox.addEventListener('change', onChange.bind(window, idx - 1, color));

    div.className = 'custom-checkbox';
    div.style.backgroundColor = color;

    label.appendChild(checkbox);
    label.appendChild(div);
    label.appendChild(text);
    parent.appendChild(label);

    config.push({
        isVisible: true,
        idx: idx - 1,
    });

    return div;
}

function formatNumber(num) {
    const numOfDigits = (Math.round(num)).toString().length;

    if (numOfDigits > 3 && numOfDigits < 7) {
        const firstPart = (num / 1000).toFixed(1);
        return `${firstPart}K`;
    } else if (numOfDigits > 6) {
        const firstPart = (num / 1000000).toFixed(1);
        return `${firstPart}M`;
    }
    return num;
}

module.exports.getTooltipInfo = getTooltipInfo;
module.exports.hexToRgb = hexToRgb;
module.exports.formatDate = formatDate;
module.exports.createTemplate = createTemplate;
module.exports.createCheckbox = createCheckbox;
module.exports.formatNumber = formatNumber;
