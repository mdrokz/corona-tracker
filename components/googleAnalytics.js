import ReactGA from "react-ga"

export const initGA = () => {
    ReactGA.initialize(process.env.googleKey,{debug: true});
}

export const logPageView = () => {
    ReactGA.set({
        page: window.location.pathname
    });
    ReactGA.pageview(window.location.pathname + window.location.search);
}