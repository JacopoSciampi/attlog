import { Component } from '@angular/core';
@Component({
    selector: 'app-spinner',
    template: `<div class="spinner-wrapper"><span class="loader"></span><span class="bold">Caricamento..</span></div>`,
    styles: [`
        @import '../../../assets/style/palette.scss';

        .spinner-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            height: 100%;
            width: 100%;
        }
        .loader {
            position: relative;
            width: 64px;
            height: 64px;
            background-color: rgba(0, 0, 0, 0.5);
            transform: rotate(45deg);
            overflow: hidden;
        }
        .loader:after{
            content: '';
            position: absolute;
            inset: 8px;
            margin: auto;
            background: hsl(200, 6%, 10%);
        }
        .loader:before{
            content: '';
            position: absolute;
            inset: -15px;
            margin: auto;
            background: hsl(8, 80%, 56%);
            animation: diamondLoader 2s linear infinite;
        }
        @keyframes diamondLoader {
            0%  ,10% {
                transform: translate(-64px , -64px) rotate(-45deg)
            }
            90% , 100% {
                transform: translate(0px , 0px) rotate(-45deg)
            }
        }
    `],
    standalone: true
})
export class SpinnerComponent {

}
