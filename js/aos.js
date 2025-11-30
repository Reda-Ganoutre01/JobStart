document.addEventListener('DOMContentLoaded', function () {
                if (window.AOS) {
                    AOS.init({
                        once: false,
                        duration: 800,
                        easing: 'ease-out-cubic',
                        offset: 120
                    });
                }
            });

            window.addEventListener('load', function () {
                if (window.AOS) AOS.refresh();
            });
