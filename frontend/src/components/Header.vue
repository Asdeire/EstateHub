<template>
    <header>
        <nav>
            <ul>
                <li><router-link to="/">Home</router-link></li>
                <li><router-link to="/listings">Listings</router-link></li>
                <li><router-link to="/login">Login</router-link></li>
            </ul>
        </nav>
    </header>
</template>

<script setup lang="ts">
// Here you can write TypeScript if necessary
</script>

<style scoped>
nav {
    background: #333;
    padding: 1rem;
}

ul {
    display: flex;
    gap: 1rem;
}

a {
    color: white;
    text-decoration: none;
}
</style>