<template>
    <span class="short-address flex-row">
        <span class="address">{{ address.substring(0, 5) }}</span>
        <!-- eslint-disable max-len -->
        <svg viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="1.5" fill="currentColor"/></svg>
        <svg viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="1.5" fill="currentColor"/></svg>
        <svg viewBox="0 0 3 3" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="1.5" fill="currentColor"/></svg>
        <!-- eslint-enable max-len -->
        <span class="address">{{ address.substring(address.length - 4) }}</span>
    </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
    props: {
        address: {
            type: String,
            required: true,
        },
    },
});
</script>

<style lang="scss" scoped>
.short-address {
    white-space: nowrap;
    align-items: center;

    .address {
        word-spacing: -0.2em;
        font-family: "Fira Mono", monospace; // TODO: Improve monospace font stack
        // transition: opacity .3s var(--nimiq-ease);
    }

    svg {
        margin-right: 0.5rem;
        opacity: 0.6;
        width: 0.375rem;
        height: 0.375rem;

        &:first-of-type {
            margin-left: 0.5rem;
        }
    }
}
</style>
