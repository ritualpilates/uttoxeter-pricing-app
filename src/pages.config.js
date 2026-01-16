import Quotes from './pages/Quotes';
import QuoteBuilder from './pages/QuoteBuilder';
import AdminSettings from './pages/AdminSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Quotes": Quotes,
    "QuoteBuilder": QuoteBuilder,
    "AdminSettings": AdminSettings,
}

export const pagesConfig = {
    mainPage: "Quotes",
    Pages: PAGES,
    Layout: __Layout,
};