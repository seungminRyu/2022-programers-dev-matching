// import debouncer from "./debouncer";

let isTimeout = true;
let timeoutId = null;

const debouncer = (time, callback) => {
    if (isTimeout) {
        isTimeout = false;
    } else {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        callback();
        isTimeout = true;
    }, time);
};

function App() {
    this.$suggestion = document.querySelector(".Suggestion");
    this.$suggestionList = this.$suggestion.querySelector("ul");
    this.$searchInput = document.querySelector(".SearchInput__input");
    this.$selectedLang = document.querySelector(".SelectedLanguage");
    this.$selectedLangList = this.$selectedLang.querySelector("ul");
    this.__selectedKeywords = [];
    // this.selectedKeywords = [];
    this.__lastInputQuery = "";
    // this.lastInputQuery
    this.__suggestionKeywords = [];
    // this.suggestionKeywords = [];
    this.selectedSuggestionIdx = 0;
    this.isSuggestionActive = false;
    this.pressedKey = null;

    const hideSuggestion = () => {
        this.selectedSuggestionIdx = 0;
        this.isSuggestionActive = false;
        this.$suggestion.style.display = "none";
    };

    const showSuggestion = () => {
        this.isSuggestionActive = true;
        this.$suggestion.style.display = "block";
    };

    const markMatchingText = () => {
        // find and mark matching text
    };

    const setSuggestionItems = () => {
        const html = this.__suggestionKeywords
            .map((item, i) => {
                markMatchingText();
                return `<li ${
                    i === this.selectedSuggestionIdx &&
                    `class="Suggestion__item--selected"`
                }>${item}</li>`;
            })
            .join("");

        this.$suggestionList.innerHTML = html;
    };

    const onSearchInputChange = async (e) => {
        const inputText = e.target.value;
        if (
            this.pressedKey === 13 ||
            this.pressedKey === 38 ||
            this.pressedKey === 40
        ) {
            return;
        }

        if (!inputText) {
            this.__suggestionKeywords = [];
            hideSuggestion();
            return;
        }

        const res = await fetch(
            `https://wr4a6p937i.execute-api.ap-northeast-2.amazonaws.com/dev/languages?keyword=${inputText}`
        )
            .then((res) => {
                return res.json();
            })
            .catch((err) => {
                console.error(err.message);
            });

        this.selectedSuggestionIdx = 0;
        this.__suggestionKeywords = res;
        localStorage.setItem("last_input_qeury", inputText);
        setSuggestionItems();
        showSuggestion();
    };

    const initSearchInputEvent = () => {
        this.$searchInput.addEventListener("keyup", (e) => {
            debouncer(300, () => onSearchInputChange(e));
        });
    };

    const setSelectedLangItems = () => {
        const html = this.__selectedKeywords
            .map((item) => `<li>${item}</li>`)
            .join("");

        this.$selectedLangList.innerHTML = html;
    };

    const setLastInputQeury = () => {
        this.$searchInput.value = this.__lastInputQuery;
    };

    const saveSelectedLangItems = () => {
        const targetKeyword =
            this.__suggestionKeywords[this.selectedSuggestionIdx];
        let nextSelectedKeywords = this.__selectedKeywords.filter(
            (el) => el !== targetKeyword
        );
        nextSelectedKeywords.push(targetKeyword);

        // remove when overflow
        if (nextSelectedKeywords.length > 5) {
            nextSelectedKeywords = nextSelectedKeywords.slice(1);
        }

        this.__selectedKeywords = nextSelectedKeywords;
        localStorage.setItem(
            "selected_keywords",
            JSON.stringify(nextSelectedKeywords)
        );

        alert(targetKeyword);
    };

    const initKeyboardEvent = () => {
        document.addEventListener("keyup", (e) => {
            this.pressedKey = window.event.keyCode;

            if (
                !this.isSuggestionActive ||
                (this.pressedKey !== 13 &&
                    this.pressedKey !== 38 &&
                    this.pressedKey !== 40)
            ) {
                return;
            }

            // up key pressed
            if (this.pressedKey === 38) {
                if (this.selectedSuggestionIdx > 0) {
                    this.selectedSuggestionIdx -= 1;
                    setSuggestionItems();
                }
            }

            // down key pressed
            if (this.pressedKey === 40) {
                if (
                    this.selectedSuggestionIdx <
                    this.__suggestionKeywords.length - 1
                ) {
                    this.selectedSuggestionIdx += 1;
                    setSuggestionItems();
                }
            }

            // enter key pressed
            if (this.pressedKey === 13) {
                saveSelectedLangItems();
                setSelectedLangItems();
            }
        });
    };

    const onSuggestionClick = (e) => {
        const targetElem = e.target.closest("li");
        if (!targetElem) return;

        const targetKeyword = targetElem.innerText;
        const targetIdx = this.__suggestionKeywords.findIndex(
            (el) => el === targetKeyword
        );

        this.selectedSuggestionIdx = targetIdx;
        saveSelectedLangItems();
        setSelectedLangItems();
    };

    const initSuggestionEvent = (e) => {
        this.$suggestion.addEventListener("click", onSuggestionClick);
    };

    const getStorageItems = () => {
        //  get selected keywords
        const storageKeywords = localStorage.getItem("selected_keywords");
        if (!storageKeywords) {
            localStorage.setItem("selected_keywords", JSON.stringify([]));
            this.__selectedKeywords = [];
        } else {
            const selectedKeywords = JSON.parse(storageKeywords);
            this.__selectedKeywords = selectedKeywords;
        }

        //  get last input query
        const storageQeury = localStorage.getItem("last_input_qeury");
        if (!storageQeury) {
            localStorage.setItem("last_input_qeury", "");
            this.__lastInputQuery = "";
        } else {
            this.__lastInputQuery = storageQeury;
        }
    };

    const initFormEvent = () => {
        document.querySelector("form").addEventListener("submit", (e) => {
            e.preventDefault();
        });
    };

    const initData = () => {
        getStorageItems();
    };

    const initElements = () => {
        hideSuggestion();
        setSelectedLangItems();
        setLastInputQeury();
    };

    const initEvents = () => {
        initFormEvent();
        initSearchInputEvent();
        initSuggestionEvent();
        initKeyboardEvent();
    };

    const initApp = () => {
        initData();
        initElements();
        initEvents();
    };

    initApp();
}

window.addEventListener("load", () => new App());
