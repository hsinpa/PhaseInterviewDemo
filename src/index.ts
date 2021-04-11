import './stylesheet/main.scss';
import ColorWheel from './ColorWheel/ColorWheel';

window.onload = () => {

    fetch('./Dataset/color_wheel_config.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        let colorWheel = new ColorWheel(myJson);
    });

};