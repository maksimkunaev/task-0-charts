class Slider {
    slider = null;
    parent = null;
    data = [];

    sliderConfig = {
        width: 15,
        left: 0,
        right: 15,
        stepY: 0,
    };

    renderMethod = () => {};

    constructor(config, data) {
        const { slider, parent, method } = config;

        this.slider = slider;
        this.parent = parent;
        this.data = data.columns[0];

        this.renderMethod = method;

        this.setConfig(config);
        this.setStyle();
        this.makeDraggable();
        this.initTouchEvents();
        this.slider.style.left = Slider.getCoords(this.parent).right - Slider.getCoords(this.slider).width - Slider.getCoords(this.parent).left + 'px';//move slider to right side of its parent
        this.callChartRender();
    }

    callChartRender() {
        const parentCoords = Slider.getCoords(this.parent);

        const { left: l, right } = Slider.getCoords(this.slider);
        const from = Math.floor(( l / parentCoords.width ) * this.data.length);
        const to = Math.ceil(( right / parentCoords.width ) * this.data.length);
        this.renderMethod({
            startDate: from <= 0 ? 1 : from,
            endDate: to,
        });

    }

    setConfig({ longChart }) {
        const parentCoords = Slider.getCoords(this.parent);
        const dayWidth = parentCoords.width / this.data.length < 15 ? 15 : parentCoords.width / this.data.length;
        const sliderWidth =  10 * dayWidth;

        this.sliderConfig = {
            width: sliderWidth,
            left: 0,
            right: sliderWidth,
            stepY: longChart.chartConfig.stepY,
        };
    }

    static getCoords(elem) {
        const box = elem.getBoundingClientRect();
        return {
            top: box.top,
            left: box.left,
            right: box.right,
            width: box.width,
        };
    }

    setStyle() {
        const { width } = this.sliderConfig;
        this.slider.style.width = width + 'px';
    }

    makeDraggable() {
        this.slider.ondragstart = function() {
            return false;
        };
        this.slider.addEventListener('mousedown',this.onMouseDown.bind(this));
    }

    onMouseDown(event) {
        event.preventDefault();
        const sliderCoords = Slider.getCoords(this.slider);

        //Click on pseudo elements are not processed
        if (event.pageX < sliderCoords.left || event.pageX >= sliderCoords.right) {
            return;
        }

        const parentCoords = Slider.getCoords(this.parent);
        const shiftX = event.pageX - sliderCoords.left;

        let handlerFunction = () => {};
        let direction = '';
        let width = sliderCoords.width;

        const moveAt = event => {

            let newLeft = event.pageX - shiftX - parentCoords.left;
            if (newLeft < 0) {
                newLeft = 0;
            }

            const rightEdge = this.parent.offsetWidth - this.slider.offsetWidth;
            if (newLeft > rightEdge) {
                newLeft = rightEdge;
            }
            this.slider.style.left = newLeft + 'px';

            const left = this.slider.style.left.split('px')[0];
            const right = newLeft + this.slider.offsetWidth;
            this.sliderConfig.left = left;
            this.sliderConfig.right = right;
            this.setStyle();

            this.callChartRender();
        };

        let resize = event => {
            let newLeft = event.pageX - shiftX - parentCoords.left;

            const left = this.slider.style.left.split('px')[0];

            const diffWidth = newLeft - left;
            if (direction === 'left') {
                const left = this.slider.style.left.split('px')[0];
                const width = this.slider.style.width.split('px')[0];
                this.sliderConfig.width = +width - diffWidth + 'px';
                this.slider.style.width = +width - diffWidth + 'px';
                this.slider.style.left = +left + diffWidth + 'px';
            } else if (direction === 'right') {
                this.setStyle();
                this.sliderConfig.width = width + diffWidth;
            }

            this.callChartRender();
        };

        const border =  (this.slider.offsetWidth - this.slider.clientWidth) / 2;
        if (event.pageX >=sliderCoords.left && event.pageX <= (sliderCoords.left + border)) {
            handlerFunction = resize;
            direction = 'left';
        } else if (event.pageX >=sliderCoords.right - border && event.pageX <=sliderCoords.right) {
            handlerFunction = resize;
            direction = 'right';
        } else {
            handlerFunction = moveAt;
        }

        handlerFunction(event);
        this.slider.style.zIndex = '1000';

        const onMouseMove = event => {
            event.preventDefault();
            requestAnimationFrame(() => {
                handlerFunction(event);
            })
        };

        const onMouseUp = event => {
            event.preventDefault();

            this.slider.removeEventListener('mousemove',onMouseMove);
            this.slider.removeEventListener('mouseup',onMouseUp);
        };

        this.slider.addEventListener('mousemove',onMouseMove);
        this.slider.addEventListener('mouseup',onMouseUp)
    }

    initTouchEvents() {
        function touchHandler(event) {
            const touch = event.changedTouches[0];

            const simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent({
                    touchstart: "mousedown",
                    touchmove: "mousemove",
                    touchend: "mouseup"
                }[event.type], true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0, null);

            touch.target.dispatchEvent(simulatedEvent);
        }

        document.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        document.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);
    }
}

module.exports = Slider;
