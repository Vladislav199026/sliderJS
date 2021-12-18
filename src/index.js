import './main.scss';

// 1. Накидать структуру слайдера  в хтмл.
// 2. Точки навигации и стрелки сделать динамически.
// 3. Слайдер сделать зацикленным.
// 4. Сделать возможность при клике на сам слайд увеличить слайд в окне.
// 5. Слайдер должен перелистываться автоматически каждые 3 сек, но при зуме слайда становиться на паузу.
// 6. Использовать use strict и ООП, а именно классы.
// 7. Для адаптива использовать matchMedia, на десктопе 3 слайда, на мобиле и таблетке один слайд.
// 8. Строить слайдер на основе SCSS  и методологии BEM.

'use strict'

class Slider {
    constructor() {
        this.win = window,
        this.doc = document.documentElement,
        this.wrapper = document.querySelector('#wrapper'),
        this.container = document.querySelector('.slider__container'),
        this.track = document.querySelector('.slider__track'),
        this.items = Array.from(document.querySelectorAll('.slider__item')),
        this.dotsList = document.createElement('ul'),
        this.dotsList.classList.add('dots'),
        this.container.insertBefore(this.dotsList, null),
        this.resizeHandler = null,
        this.position = 0,
        this.positionForDots = 0,
        this.initial = 0,
        this.count = 0,
        this.time = 5000,
        this.windowWidth = window.innerWidth,
        this.tar = null,
        this.moveSlide = null,
        this.slidesToShow = null,
        this.containerWidth = null,
        this.slidesToScroll = 1,
        this.itemWidth = null,
        this.movePosition = null,
        this.btnNext = null,
        this.btnPrev = null,
        this.arrDots = null,
        this.clone = null,
        this.modalContainer = null
    }

    activateResizeHandler() {
        let resizeClass = 'resize-active';
        let flag = null;
        let timer = null;
    
        const removeClassHandler = () => {
            flag = false;
            this.doc.classList.remove(resizeClass);
        };
    
        this.resizeHandler = () => {
            if (!flag) {
                flag = true;
                this.doc.classList.add(resizeClass);
                
                clearTimeout(timer);
            };
            timer = setTimeout(removeClassHandler, 100);

            if (window.matchMedia("(max-width: 768px)").matches) {
                this.slidesToShow = 1;           
                this.addLiForImage(this.items.length);
            } else {
                this.slidesToShow = 3;
                this.addLiForImage(this.items.length - 2);
            };
            
            this.activeDots();
            this.activeDotsPush();

            if (window.matchMedia("(max-width: 1200px)").matches) {
                this.containerWidth = this.windowWidth;
            } else {
                this.containerWidth = 1200;
            };

            this.windowWidth = window.innerWidth;
            this.itemWidth = this.containerWidth / this.slidesToShow;
            this.movePosition = this.slidesToScroll * this.itemWidth;
            this.track.style.transform = `translate(${-(this.initial * this.itemWidth) + 'px'})`;

            this.sizeForItem();
        };
        
        this.win.addEventListener('resize', this.resizeHandler);
        this.win.addEventListener('orientationchange', this.resizeHandler);
    }

    sizeForItem() {
        this.items.forEach((item) => {
            item.style.cssText = `min-width: ${this.itemWidth + 'px'}`;
        });
    }

    btnEventNext() {
        this.btnNext = document.createElement('button');
        this.btnNext.innerHTML = `&rarr;`;
        this.container.insertBefore(this.btnNext, null);

        this.btnNext.addEventListener('click', () => {
            this.infinitySliderNext();
            this.initial++;
            this.setPosition(this.position, null);
            this.activeDots();
            this.endTransition();
        });
    }

    btnEventPrev() {
        this.btnPrev = document.createElement('button');
        this.btnPrev.innerHTML = `&larr;`;
        this.container.insertBefore(this.btnPrev, null);

        this.btnPrev.addEventListener('click', () => { 
            this.infinitySliderPrev();
            this.initial--;
            this.setPosition(this.position, null);
            this.activeDots();
            this.endTransition();
        });
    }

    addLiForImage(len) {
        if (this.dotsList.children.length - 1 !== len) {
            this.dotsList.innerHTML = '';
        };

        for (let i = 0; i < len; i++) {
            let dot = document.createElement('li');
            this.dotsList.appendChild(dot);
        };
    }

    activeDots() {
        this.arrDots = Array.from(document.querySelectorAll('.dots li'));

        for (let i = 0; i < this.arrDots.length; i++) {
            if (this.initial === i) {
                this.arrDots[i].classList.add('active-dot');
            } else if (this.initial !== i) {
                this.arrDots[i].classList.remove('active-dot');
            };

            if (this.initial === this.arrDots.length) {
                this.initial = 0;
                this.arrDots[i].classList.add('active-dot');
            } else if (this.initial === -1) {
                this.initial = this.arrDots.length - 1;
            };
        };
    }

    activeDotsPush() {
        for (let i = 0; i < this.arrDots.length; i++) {
            this.arrDots[i].addEventListener('click', () => {
                this.arrDots.forEach( (element) => {
                    if (element.classList.contains('active-dot')) {
                        element.classList.remove('active-dot');
                    };
                });
    
                this.arrDots[i].classList.toggle('active-dot');
                this.initial = i;
                this.positionForDots = this.positionForDots - this.movePosition * [i];
                this.setPosition(null, this.positionForDots);
                this.position = this.positionForDots;

                if (this.positionForDots) {
                    this.positionForDots = 0;
                };
            });
        };
    }

    events() {
        this.items.forEach((sliderItem, index) => {
            sliderItem.addEventListener('click', (e) => {
                    this.count++;
                    e.target.setAttribute('data-number', index);
                    this.tar = Number(e.target.getAttribute('data-number'));
                    this.clone = this.items[this.tar].children[0].cloneNode();
                    this.modalContainer = document.createElement('div');
                    this.modalContainer.classList.add('modal-content');
                    this.modalContainer.prepend(this.clone);
                    this.wrapper.append(this.modalContainer);
            });

            sliderItem.addEventListener('mouseover', () => { 
                if (this.count === 0) {
                    this.items.forEach((item) => {
                        item.classList.add('blur');
                    });
                };
            });

            sliderItem.addEventListener('mouseout', () => { 
                this.items.forEach((item) => {
                    item.classList.remove('blur');
                });
            });

            sliderItem.addEventListener('mouseover', () => {
                if (this.count === 0) {
                    sliderItem.classList.add('active_item_blur_none');
                };
            });

            sliderItem.addEventListener('mouseout', () => {
                sliderItem.classList.remove('active_item_blur_none');
            });
        });


    }

    removeZoomImage() {
        document.addEventListener('click', (e) => { 
            if(e.target === this.modalContainer) { 
                this.modalContainer.remove();
                this.count = 0;
                this.start();
            };
        });
    }

    setPosition (position, positionForDots) {
        if (position != null) {
            this.track.style.transform = `translate(${-(this.initial * this.itemWidth) + 'px'})`;
        } else if (positionForDots != null) {
            this.track.style.cssText = `transform: translate(${positionForDots + 'px'})`;
        };
    }

    infinitySliderNext() {
        this.position = this.position - this.movePosition;
    
        if (this.initial === this.items.length - this.slidesToShow) {
            this.position = 0;
            this.initial = -1;
        };
    }

    infinitySliderPrev() {
        this.position = this.position + this.movePosition;
        
        if (this.initial === 0) {
            this.position = -(this.itemWidth * (this.items.length - this.slidesToShow));
            this.initial = this.items.length + 1 - this.slidesToShow;
        };
    }

    start() {
        if (this.count === 0) {
            this.moveSlide = setTimeout( () => {
                this.infinitySliderNext();
                this.initial++;
                this.setPosition(this.position, null);
                this.activeDots();
                this.start();
                
            }, this.time);
        };
    }

    endTransition() {
        this.container.addEventListener('mouseover', () => {
            clearTimeout(this.moveSlide);
        });
    }

    restartTransition() {
        this.container.addEventListener('mouseout', () => {
            this.start();
        });
    }

    init() {
        this.activateResizeHandler();
        this.resizeHandler();
        this.events();
        this.btnEventNext();
        this.btnEventPrev();
        this.start();
        this.removeZoomImage();
        this.endTransition();
        this.restartTransition();
        
    }
};

let slider = new Slider();
slider.init();