import { useEffect, useRef, memo } from 'react';

function EconomicCalendarWidget() {
    const container = useRef();

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = `
      {
        "colorTheme": "dark",
        "isTransparent": true,
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "importanceFilter": "-1,0,1",
        "countryFilter": "us,eu,gb,jp,au,ca,ch,cn"
      }`;

        container.current.innerHTML = '';
        container.current.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}

export default memo(EconomicCalendarWidget);
