import i18n from "i18next";

export default function LanguageSwitcher() {
    return (
        <>
            <button onClick={() => i18n.changeLanguage("ca")}>CA</button>
            <button onClick={() => i18n.changeLanguage("es")}>ES</button>
            <button onClick={() => i18n.changeLanguage("en")}>EN</button>
        </>
    );
}