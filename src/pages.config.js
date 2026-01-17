import AdminSettings from './pages/AdminSettings';
import QuoteBuilder from './pages/QuoteBuilder';
import Quotes from './pages/Quotes';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminSettings": AdminSettings,
    "QuoteBuilder": QuoteBuilder,
    "Quotes": Quotes,
}

export const pagesConfig = {
    mainPage: "Quotes",
    Pages: PAGES,
    Layout: __Layout,
};