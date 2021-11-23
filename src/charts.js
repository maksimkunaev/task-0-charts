const utils = require('./utils');
const hexToRgb = utils.hexToRgb;
const getTooltipInfo = utils.getTooltipInfo;
const formatDate = utils.formatDate;
const formatNumber = utils.formatNumber;

class Chart {
    canvas = null;
    domElems = {};

    canvasConfig = {
        width: 600,
        height: 500,
        ref: null,
    };

    chartConfig = {
        screenWidth: null,
        columns: [],
        xPositions: [],
        x0: 30,
        y0: 30,
        stepX: 10,
        stepY: 10,
        countX: 0,
        countY: 0,
        data: [],
        dates: [],
        view: '',
        datesPerLine: 8,
        tooltipInfo: {},
        isVisible: [],
        pageX: null,
    };

    constructor(domElems, data, view) {
        const { canvas } = domElems;
         this.canvas = document.getElementById(canvas);
         this.domElems = domElems;

        this.ctx = this.canvas.getContext("2d");

        this.chartConfig.data = data;
        this.canvasConfig.ref = canvas;
        this.setScreenOptions();
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        view === 'short' && this.drawShort({
            startDate: 0,
        });
        view === 'long' && this.drawLong(data, 0);
    }

    setConfig(startDate, endDate, view) {
        const { data } = this.chartConfig;
        const { columns, colors } = this.chartConfig.data;

        const { width, height } = this.canvasConfig;
        const { isVisible } = this.chartConfig;
        let maxX = 0;
        let maxY = 0;
        this.chartConfig.view = view;

        this.chartConfig.columns = [];

        let newColumns = columns.slice();

        //switch on and off different graphics
        if (isVisible.length > 1) {
            isVisible.forEach((item, index) => {
                const newIndex = isVisible.length - index - 1;

                if (isVisible[newIndex].isVisible === false) {
                    if (newColumns.length > 2) {
                        newColumns.splice(newIndex + 1, 1);
                    }
                }
            })
        };

        newColumns.forEach((column, idx) => {
            //newColumns[0] is X columns, do not process
            if (idx === 0) return;

            const start = startDate ? startDate : -11;
            const end = endDate ? endDate + 1: column.length;

            let newData = [];

            switch(view) {
                case 'short':
                newData = column.slice(start, end);
                    break;

                case 'long':
                newData = column.slice(1);
                    break;

                default:
                    newData = column.slice(1);
                    break;
            }

            // set stepY
            maxY = Math.max(...newData.slice(1)) > maxY ? Math.max(...newData.slice(1)) : maxY;

            // set stepX
            maxX = newData.length - 1;

            const fieldName = column[0];
            const name = data.names[fieldName];

            const color = colors[fieldName];
            const newColumn = {
                start,
                end,
                name,
                data: newData,
                color,
            };
            this.chartConfig.columns.push(newColumn);

            //set array of dates for X coordinate
            if (idx !== 1) return; //only for one column is enough
            this.chartConfig.dates = this.chartConfig.data.columns[0].slice(start, end).map(ms => {
                return formatDate(new Date(ms))
            });
        });

        this.chartConfig.countX = maxX;
        this.chartConfig.countY = maxY;

        this.chartConfig.stepY = height/ maxY;
        this.chartConfig.stepX = endDate ? (width * 1.1) / maxX : width / maxX ;
    }

    drawShort(config) {
        const { startDate, endDate } = config;
        this.setConfig(startDate, endDate, 'short');
        this.clearChart();
        this.drawChart();
        this.drawHorizontalLines();
        this.drawDates();
        this.drawTooltip();
    }

    drawLong(data, startDate, endDate) {
        this.setConfig(startDate, endDate, 'long');
        this.drawChart()
    }

    drawChart() {
        const { height } = this.canvasConfig;
        const { y0, stepX, stepY, columns, view, dates } = this.chartConfig;

        const { ctx } = this;
        const draw = (column, index) => {
            ctx.beginPath();

            const { data, color } = column;
            data.forEach((point, idx) => {
                let x = idx * stepX;
                let y = y0 + (height - y0 - point * stepY);
                if (idx === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);

                //remember xPosition for every point
                if (view === 'short' && index === 0) {
                    this.chartConfig.xPositions.push({
                        date: dates[idx].short,
                        xPosition: x,
                    });
                }
            });

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        columns.forEach(draw);
    }

    drawHorizontalLines() {
        const { countY } = this.chartConfig;
        const linesCount = 5;
        const step = Math.ceil( countY / linesCount);
        const { width, height } = this.canvasConfig;
        const { stepY, y0 } = this.chartConfig;

        //initialize horizontal lines array
        let lines = new Array(linesCount).fill(step);

        //set lines array
        lines.map( (step, idx) => {
            lines[idx] = step * idx
        });

        lines.forEach(lineStep => {
            const yPosition = y0 + (height - stepY * lineStep - y0);
            const text = String(Math.round(lineStep));

            this.drawLine(0, yPosition, width, yPosition, '#9aa6ae');
            this.drawText(formatNumber(text), 3, yPosition - 10);
        });
    }

    drawLine(x0, y0, x, y, color = '#9aa6ae', width = 1) {
        const { ctx } = this;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    drawText(text, x, y, color = '#9aa6ae', width = 1) {
        const { ctx } = this;
        const { font } = this.chartConfig;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text, x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    drawDates() {
        const { xPositions, datesPerLine  } = this.chartConfig;
        const { height } = this.canvas;

        let textSpace = Math.round(xPositions.length / datesPerLine);
        const datesPositions = xPositions.filter((i,idx)=>{
            return !(idx % textSpace);
        });

        datesPositions.forEach(position => {
            const color = '#9da8af';
            this.drawText(position.date, position.xPosition, height, color);
        });
    }

    clearChart() {
        this.ctx.clearRect(0, 0, this.canvas.width, this. canvas.height);
        this.chartConfig.xPositions = [];
    }

    setScreenOptions() {
        const { y0 } = this.chartConfig;
        this.chartConfig.screenWidth = screen.width;
        this.chartConfig.isMobile = screen.width <= 520;
        const { isMobile } = this.chartConfig;
        this.chartConfig.font = isMobile ? "300 25px sans-serif" : "100 20px sans-serif";
        this.chartConfig.datesPerLine = isMobile ? 6 : 8;

        this.canvasConfig = {
            width: isMobile ? 600 : 1800,
            height: isMobile ? 500 : 500,
        };
        this.canvas.width = this.canvasConfig.width;
        this.canvas.height = this.canvasConfig.height + y0;
        document.addEventListener('resize', this.setScreenOptions);
    }

    renderChart(config) {

        this.chartConfig = {
            ...this.chartConfig, ...config
        };
        this.drawShort({
            startDate: this.chartConfig.startDate,
            endDate: this.chartConfig.endDate,
        });
    }

    onCanvasClick(e) {
        const { pageX } = e;
        const { left, width } = this.canvas.getBoundingClientRect();

        const y0 = 0;
        const height = 500;
        const resolution = this.canvas.width / width;
        const x0 = (pageX - left) * resolution;

        // we need to know where we draw horizontal line and what graphics we across
        // we get Image Line Data (where horizontal line will be drawn)
        const lineData = this.ctx.getImageData(x0, y0, 1, height);
        let colors = [];

        const { columns, stepY, tooltipInfo } = this.chartConfig;

        const originalColorsInRgb = columns.map(column => {
            const rgbColor = hexToRgb(column.color);
            return {
                ...column,
                rgbColor,
            }
        });

        const pixelPerDot = lineData.data.length / height;
        const coefficient = pixelPerDot / 4; //different browsers has different resolution with method getImageData

        // and will see what color we across
        lineData.data.map((color, idx)=>{
            if (color) {
                let colorPosition = idx % 4;
                let startColorPoint = idx - colorPosition;

                let endColorPoint = startColorPoint + 4;
                const rgbaArray = lineData.data.slice(startColorPoint, endColorPoint);

                const rgb = {
                    r: rgbaArray[0],
                    g: rgbaArray[1],
                    b: rgbaArray[2],
                    yPosition: startColorPoint / (4 * coefficient),
                };

                originalColorsInRgb.forEach((column, idx) => {
                    const { rgbColor } = column;
                    for (const key in rgbColor) {
                        const diff = Math.abs(rgbColor[key]  - rgb[key]);
                        if (diff > 0.03 * rgbColor[key]) {
                            return;
                        }
                    }

                    const dotColor = {
                      yPosition: rgb.yPosition,
                      name: column.name,
                      color: column.color,
                    };

                    colors.push(dotColor)
                });
            }
        });

        const config = getTooltipInfo(colors, columns, stepY, y0, height);
        if (tooltipInfo.x0 === x0) {
            return;
        }

        this.chartConfig.tooltipInfo = {
            yPoints: config,
            x0,
            clicked: true,
        };
        this.chartConfig.pageX = pageX;

        this.renderChart();
        this.domElems.wrap.addEventListener('mousedown', this.clickOutside.bind(this));
    }

    clickOutside({target}) {
        if (target !== this.canvas && target !== this.domElems.switchLabel) {
            this.deleteTooltip();
            this.renderChart();
        }
    }

    drawTooltip() {
        const { tooltipInfo, xPositions, dates, stepY, pageX } = this.chartConfig;
        const { x0, yPoints, clicked } = tooltipInfo;
        if (!clicked) return;

        let formatDate = '';

        xPositions.map((xPos, idx) => {
            if (xPos.xPosition <= x0 && xPositions[idx + 1].xPosition >= x0) {
                const date = new Date(dates[idx].ms);
                const options = { weekday: 'short', month: 'short', day: 'numeric' };

                formatDate = date.toLocaleDateString('en-US', options);
            }
        });

        const y0 = 100;
        const height = 500;
        if (clicked) {
            this.drawLine(x0, y0, x0, height, 'rgba(223, 230, 235, 0.5)', 2);
        }

        const { tooltipElem, columnsElem, dateElem } = this.domElems;
        this.chartConfig.tooltipInfo.node = tooltipElem;
        this.chartConfig.tooltipInfo.date = formatDate;
        tooltipElem.style.display = 'flex';
        const tooltipCenter = tooltipElem.getBoundingClientRect().width / 2;
        tooltipElem.style.transform = `translateX(${pageX - tooltipCenter}px)`;
        dateElem.textContent = formatDate;

        columnsElem.innerHTML = null;
        for (const key in yPoints) {
            const point = yPoints[key];

            let y = height - point.yPosition * stepY;
            let color = point.color;
            this.drawCircle(x0, y, color);
            Chart.drawTooltipName(point, columnsElem);
        }
    }

    deleteTooltip() {
        this.chartConfig.tooltipInfo.node.style.display = 'none';
        this.chartConfig.tooltipInfo.clicked = false;
    }

    drawCircle(x, y, color) {
        const { ctx } = this;
        const { theme } = this.chartConfig;
        const { subColor } = theme;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);

        ctx.fillStyle = subColor;
        ctx.fill();
        ctx.stroke();
    }

    static drawTooltipName(data, parents) {
        const column = document.createElement('div');
        const spanValue = document.createElement('span');
        const spanName = document.createElement('span');
        spanValue.textContent = data.yPosition;
        spanName.textContent = data.name;
        spanName.style.textTransform = 'uppercase';
        column.classList.add('column');
        column.style.color = data.color;
        column.appendChild(spanValue);
        column.appendChild(spanName);

        parents.appendChild(column);
    }
}

module.exports = Chart;