const Chart = require('./charts');
const Slider = require('./slider');
const utils = require('./utils');
const createTemplate = utils.createTemplate;
const createCheckbox = utils.createCheckbox;
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue} from "firebase/database";;

class Card {
  template = {};
  theme = {
    day: {
      wrap: 'transparent',
      sliderElem: 'slider',
      labelText: 'Switch to Night Mode',
      tooltip: 'tooltip',
      checkboxes: '#000',
      mainColor: '#000',
      subColor: '#fff',
    },
    night: {
      wrap: '#242f3e',
      sliderElem: 'slider-nightTheme',
      labelText: 'Switch to Day Mode',
      tooltip: 'tooltip-nightTheme',
      checkboxes: '#fff',
      mainColor: '#fff',
      subColor: '#222f3f',
    }
  };

  constructor(id, data) {
    this.data = data;

    this.createTemplate(id);
    this.initChart();
    this.initSlider();

    this.template.switcher.addEventListener('change', this.onChangeTheme);
    this.switchTheme.call(this, 'day');

    this.createCheckboxes();
  }

  createTemplate(id) {
    const id1 = `view_${id}`;
    const id2 = `timeLine_${id}`;

    this.template = createTemplate(id1, id2);
    this.id1 = id1;
    this.id2 = id2;

    const {
      wrapBlock,
    } = this.template;

    document.body.appendChild(wrapBlock);
  }

  initChart() {
    const { id1, id2, data } = this;

    const {
      wrap,
      dateElem,
      columnsElem,
      tooltipElem,
      labelText,
    } = this.template;

    const configShortChart = {
      wrap,
      canvas: id1,
      tooltipElem,
      columnsElem,
      dateElem,
      switchLabel: labelText,
    };

    const configLongChart = {
      canvas: id2,
    };

    this.shortChart = new Chart(configShortChart, data, 'short');
    this.longChart = new Chart(configLongChart, data, 'long');
    const { renderChart } = this.shortChart;
    this.renderChart = renderChart;
  }

  initSlider() {
    const { id1, shortChart, longChart, renderChart, data } = this;

    const {
      lineChart,
      sliderElem,
    } = this.template;

    const configSlider = {
      main: id1,
      slider: sliderElem,
      parent: lineChart,
      method: renderChart.bind(shortChart),
      longChart: longChart,
    };

    //init draggable slider
    new Slider(configSlider, data);
  }

  onChangeTheme = ({target}) => {
    const { checked } = target;
    const theme = checked ? 'night' : 'day';

    this.switchTheme();
  };

  switchTheme(mode) {
    const { shortChart, theme } = this;

    const {
      wrap,
      sliderElem,
      tooltipElem,
      checkboxes,
      labelText,
    } = this.template;

    const { renderChart } = this;
    let newTheme = theme[mode];
    let nightTheme = theme.night;

    wrap.style.color = newTheme.mainColor;
    wrap.style.backgroundColor = newTheme.wrap;
    labelText.innerText = newTheme.labelText;
    checkboxes.style.color = newTheme.checkboxes;

    if (mode === 'night') {
      sliderElem.classList.add(nightTheme.sliderElem);
      tooltipElem.classList.add(nightTheme.tooltip);

    } else if (mode === 'day') {
      sliderElem.classList.remove(nightTheme.sliderElem);
      tooltipElem.classList.remove(nightTheme.tooltip);
    }

    renderChart.call(shortChart, {
      theme: theme[mode],
    })
  }

  createCheckboxes = () => {
    const { shortChart, data } = this;

    const {
      checkboxes,
    } = this.template;

    const { renderChart } = this;

    function switchData(data) {
      const changeData = (idx, color, e)=> {
        const { checked } = e.target;
        const parent = e.target.parentNode;
        const customCheckbox = parent.querySelector('.custom-checkbox');

        config[idx].isVisible = checked;
        customCheckbox.style.backgroundColor = checked ? color : 'transparent';
        shortChart.renderChart({
          isVisible = config,
        });
      };

      const config = [];
      data.columns.map((col, idx) => {
        if (idx === 0) return;
        const fieldName = col[0];
        const color = data.colors[fieldName];
        const name = data.names[fieldName];

        createCheckbox(name, idx, config, changeData, checkboxes, color);
      });
    }

    switchData(data, renderChart.bind(shortChart));
  };
}

function init(charts) {
  charts.forEach((chart, index) => {
    new Card(index, chart)
  })
}

function main() {
  const firebaseConfig = {
    apiKey: "AIzaSyCdp-7vQrEw9HtaPQ_U7BnQ_UnjT5uHrd0",
    authDomain: "charts-e38b9.firebaseapp.com",
    databaseURL: "https://charts-e38b9-default-rtdb.firebaseio.com",
    projectId: "charts-e38b9",
    storageBucket: "charts-e38b9.appspot.com",
    messagingSenderId: "1073528811796",
    appId: "1:1073528811796:web:bc2593236f80de39891201"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const db = getDatabase();
  const starCountRef = ref(db);

  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    console.log(JSON.parse(data.charts))
    init(data.charts);
  });
}

main(init);
