<template>
    <div class="settings flex-row">
        <div class="mobile-menu-bar flex-row">
            <button class="reset menu-button" @click="$router.push({name: 'settings', query: {sidebar: true}})">
                <MenuIcon/>
            </button>
        </div>

        <div class="column left-column flex-column">
            <section>
                <h2 class="nq-label">{{ $t('General') }}</h2>

                <div class="setting">
                    <div class="description">
                        <label class="nq-h2" for="language">{{ $t('Language') }}</label>
                        <p class="nq-text">
                            {{ $t('Change your language setting.') }}
                        </p>
                    </div>
                    <select id="language" name="language" @input="setLanguage($event.target.value)" disabled>
                        <option
                            v-for="lang in Languages" :key="lang.code"
                            :value="lang.code" :selected="language === lang.code"
                        >{{ lang.name }}</option>
                    </select>
                </div>

                <div class="setting">
                    <div class="description">
                        <label class="nq-h2" for="decimals">{{ $t('Show Decimals') }}</label>
                        <p class="nq-text">
                            {{ $t('Edit the amount of decimals visible for NIM values.') }}
                        </p>
                    </div>

                    <select id="decimals" name="decimals" @input="setDecimals(parseInt($event.target.value))">
                        <option value="0" :selected="decimals === 0">{{ $t('None') }}</option>
                        <option value="2" :selected="decimals === 2">2</option>
                        <option value="5" :selected="decimals === 5">{{ $t('all') }}</option>
                    </select>
                </div>

                <div class="setting">
                    <div class="description">
                        <label class="nq-h2" for="contact-import">{{ $t('Import Contacts') }}</label>
                        <p class="nq-text">
                            {{ $t('Import contacts that you exported from the Safe.') }}
                        </p>
                    </div>

                    <label class="nq-button-pill light-blue">
                        {{ $t('Load file') }}
                        <input type="file" @change="loadFile" ref="$fileInput">
                    </label>
                </div>

                <!-- <div class="setting">
                    <div class="description">
                        <label class="nq-h2" for="theme">{{ $t('Interface Theme') }}</label>
                        <p class="nq-text">
                            {{ $t('Change your wallet color scheme.') }}
                        </p>
                    </div>

                    <select name="theme" id="theme" @input="colorMode($event.target.value)" disabled>
                        <option value="automatic" :selected="colorMode === 'automatic'">{{ $t('Auto') }}</option>
                        <option value="light" :selected="colorMode === 'light'">{{ $t('Light') }}</option>
                        <option value="dark" :selected="colorMode === 'dark'">{{ $t('Dark') }}</option>
                    </select>
                </div> -->

                <!-- <div class="setting">
                    <div class="description">
                        <label class="nq-h2">{{ $t('Product Tour') }}</label>
                        <p class="nq-text">
                            {{ $t('Go through the product again') }}
                        </p>
                    </div>
                    <button class="nq-button-pill light-blue disabled">{{ $t('Start Tour') }}</button>
                </div> -->
            </section>

            <section>
                <h2 class="nq-label">{{ $t('Developer') }}</h2>

                <div class="setting">
                    <div class="description">
                        <label class="nq-h2">{{ $t('Clear Cache') }}</label>
                        <p class="nq-text">
                            {{ $t('Reset your wallet settings and reload data from the blockchain.') }}
                        </p>
                    </div>
                    <button class="nq-button-pill light-blue" @click="clearCache">{{ $t('Clear') }}</button>
                </div>
            </section>
        </div>
        <div class="column right-column flex-column">
            <section>
                <h2 class="nq-label">{{ $t('Reference currency') }}</h2>

                <div class="setting currency-selector">
                    <button v-for="currencyOption of sortedFiatCurrency()"
                        :key="currencyOption"
                        :class="{ selected: currencyOption === currency }"
                        class="reset currency"
                        @click="setCurrency(currencyOption)"
                    >
                        <img :src="require(`../../assets/currencies/${currencyOption}.svg`)"/>
                        {{currencyOption.toUpperCase()}}
                    </button>
                </div>
            </section>
        </div>

        <div class="copyright">
            &copy; {{ Math.max(2020, new Date().getFullYear()) }} Nimiq Foundation
            <strong>&middot;</strong>
            <router-link to="disclaimer">{{ $t('Disclaimer') }}</router-link>
        </div>

        <Portal>
            <transition name="modal">
                <router-view name="modal"/>
            </transition>
        </Portal>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
// @ts-ignore missing types for this package
import { Portal } from '@linusborg/vue-simple-portal';

import MenuIcon from '../icons/MenuIcon.vue';
import { useSettingsStore, ColorMode } from '../../stores/Settings';
import { FiatCurrency } from '../../lib/Constants';
import { useFiatStore } from '../../stores/Fiat';
import { clearStorage } from '../../storage';
import { Languages } from '../../i18n/i18n-setup';
import { useContactsStore } from '../../stores/Contacts';

export default defineComponent({
    setup(props, context) {
        const settings = useSettingsStore();

        const { currency, setCurrency } = useFiatStore();

        function clearCache() {
            /* eslint-disable-next-line no-restricted-globals, no-alert */
            if (!confirm('Really clear cache?')) return;
            clearStorage();
            window.location.reload();
        }

        function sortedFiatCurrency() {
            return Object.values(FiatCurrency).sort();
        }

        const $fileInput = ref<HTMLInputElement | null>(null);

        function readFile(data: string) {
            // Reset file input
            $fileInput.value!.value = '';

            let importedContacts = [];
            try {
                importedContacts = JSON.parse(data);
            } catch (e) {
                alert(context.root.$t('Cannot import contacts, wrong file format.')); // eslint-disable-line no-alert
                return;
            }

            // Make sure the input is a non-empty array
            if (!importedContacts.length) {
                alert(context.root.$t('File contains no contacts.')); // eslint-disable-line no-alert
                return;
            }

            const { state: contacts$, setContact } = useContactsStore();

            for (const contact of importedContacts) {
                if (!contact.label || !contact.address) continue;

                const storedLabel = contacts$.contacts[contact.address];
                if (storedLabel) {
                    if (storedLabel === contact.label) continue;
                    else {
                        // eslint-disable-next-line no-alert, no-restricted-globals
                        const shouldOverwrite = confirm(context.root.$t(
                            `A contact with the address "{address}", but a different name already exists.
                            Do you want to replace it?`, contact.address) as string);
                        if (!shouldOverwrite) continue;
                    }
                }

                setContact(contact.address, contact.label);
            }
            alert(context.root.$t('OK! Contacts imported successfully.')); // eslint-disable-line no-alert
        }

        function loadFile(event: InputEvent) {
            const fileList = (event.target as HTMLInputElement).files;
            if (!fileList) return;
            const file = fileList[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => readFile(e.target!.result as string);
            reader.readAsText(file);
        }

        return {
            clearCache,
            Languages,
            ColorMode,
            currency,
            sortedFiatCurrency,
            setCurrency,
            ...settings,
            $fileInput,
            loadFile,
        };
    },
    components: {
        MenuIcon,
        Portal,
    },
});
</script>

<style lang="scss" scoped>
@import '../../scss/mixins.scss';

.settings {
    align-items: flex-start;
    padding: 4rem;
    height: 100%;
}

.column {
    justify-content: flex-start;
    @include ios-flex;

    section:first-child {
        padding-top: 2rem;
    }

    section:last-child {
        padding-bottom: 2rem;
    }

    &.left-column {
        flex-shrink: 1;
        border-right: 0.25rem solid var(--text-10);

        section {
            padding-left: 3rem;
        }
    }

    &.right-column {
        flex-shrink: 2;
    }
}

section {
    box-sizing: content-box;
    max-width: 48rem;
    padding: 6rem 8rem;

    &:not(:last-child) {
        border-bottom: 0.25rem solid var(--text-10);
    }
}

.nq-label {
    margin: 0 0 4rem;
    color: var(--text-40);
}

.nq-text {
    color: var(--text-100);
}

.nq-button-pill {
    padding: 0.5rem 2rem;
    border-radius: 3.75rem;
    font-size: var(--body-size);

    &.disabled {
        filter: grayscale(100%);
        cursor: normal;
        pointer-events: none;
    }
}

.setting:last-child .nq-text {
    margin-bottom: 0;
}

.setting {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;

    &:not(:first-of-type) {
        margin-top: 4rem;
    }

    > *:not(.description) {
        flex-shrink: 0;
    }

    .description {
        margin-right: 5rem;
        max-width: 30rem;

        p {
            margin-top: 0.75rem;
            margin-bottom: 0;
        }
    }
}

select {
    font-size: inherit;
    font-family: inherit;
    font-weight: bold;
    font-size: var(--body-size);
    line-height: inherit;
    color: inherit;
    border: none;
    appearance: none;
    cursor: pointer;

    box-shadow: inset 0 0 0 0.1875rem var(--text-16);
    border-radius: 2.5rem;
    padding: {
        top: 0.625rem;
        bottom: 0.875rem;
        left: 2rem;
        right: 3.5rem;
    }

    background-color: transparent;
    background-image: url('../../assets/arrow-down.svg');
    background-size: 1.25rem;
    background-repeat: no-repeat;
    background-position-x: calc(100% - 1.75rem);
    background-position-y: 55%;

    &[name="theme"] {
        text-transform: capitalize;
    }

    &:disabled {
        opacity: .5;
        cursor: default;
    }
}

input[type="file"] {
    display: none;
}

.currency-selector {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin: -1rem;
}

.currency {
    display: flex;
    flex-direction: row;
    align-items: center;

    box-sizing: border-box;
    width: 11.875rem;
    margin: 1rem;
    padding: 1rem 1.5rem 1rem 1rem;
    border-radius: 0.75rem;
    color: var(--text-70);

    font-weight: bold;
    letter-spacing: 0.125rem;
    font-size: var(--body-size);

    transition: {
        property: background-color, box-shadow, color;
        duration: 0.3s;
    };

    &:hover,
    &:focus,
    &:focus-within,
    &.selected {
        color: var(--text-100);
    }

    &:hover,
    &:focus,
    &:focus-within {
        background-color: var(--nimiq-highlight-bg);
    }

    &.selected {
        background-color: white;
        box-shadow: 0px 0.0421rem 0.25rem rgba(0, 0, 0, 0.025),
                    0px 0.1875rem 0.375rem rgba(0, 0, 0, 0.05),
                    0px 0.5rem 2rem rgba(0, 0, 0, 0.07);
    }

    img {
        border-radius: 50%;
        margin-right: 1.25rem;
        width: 3.5rem;
        height: 3.5rem;
    }
}

.mobile-menu-bar {
    display: none;
}

.copyright {
    position: absolute;
    left: 3.25rem;
    bottom: 3.25rem;

    font-size: var(--small-size);
    font-weight: 600;
    opacity: 0.6;

    strong {
        margin-left: 0.5rem;
        margin-right: 1rem;
    }

    a {
        color: inherit;
    }
}

@media (max-width: 1160px) { // Half mobile breakpoint
    .settings {
        padding: 5rem 3rem 3rem 4rem;
    }

    .mobile-menu-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;
        flex-shrink: 0;
        z-index: 1;
        margin-bottom: 0.5rem;
        position: absolute;
        left: 3rem;
        top: 3rem;

        button.reset {
            opacity: 0.3;
            font-size: 2.5rem;
        }

        .menu-button {
            width: 3.5rem;
            height: 2.75rem;
            box-sizing: content-box;
        }
    }

    section {
        padding: 4rem 5rem;
    }
}

@media (max-width: 700px) { // Full mobile breakpoint
    .settings {
        width: 100vw;
        padding: 3.25rem 3rem;
        overflow-y: auto;
        flex-direction: column;
        align-items: stretch;
        flex-wrap: nowrap;

        .description {
            margin-right: 3rem;
        }
    }

    .mobile-menu-bar {
        position: relative;
        left: 0;
        top: 0;
    }

    section {
        margin: 0;
        padding: 4rem 0 !important;
        max-width: none;
    }

    .column {
        &.left-column,
        &.right-column {
            flex-shrink: 0;
        }

        &.left-column {
            border-right: none;
            margin: 0;

            section {
                border-bottom: 0.25rem solid var(--text-10);

                &:first-child {
                    padding-top: 4rem;
                }

                &:last-child {
                    padding-bottom: 4rem;
                }
            }
        }

        &.right-column section:last-child {
            padding-bottom: 0;
        }
    }

    .copyright {
        position: unset;
    }
}
</style>
