<template>
    <footer class="footer">
        <div class="footer-left">
            Copyright ©2025 EstateHub. All Rights Reserved
        </div>
        <div class="footer-right">
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn">
                <img src="../assets/linkedin.png" alt="LinkedIn" />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">
                <img src="../assets/facebook.png" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">
                <img src="../assets/instagram.png" alt="Instagram" />
            </a>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 150px;
    background-color: #F3F6F5;
    font-size: 16px;
    margin-top: 30px;
}

.footer-right a {
    display: inline-block;
    margin-left: 12px;
    transition: transform 0.3s;
}

.footer-right a:hover {
    transform: scale(1.1);
}

.footer-right img {
    height: 25px;
    display: block;
}

@media (max-width: 1000px) {
    .footer {
        padding: 16px 20px;
    }
}

@media (max-width: 600px) {
    .footer {
        flex-direction: column;
    }
    .footer-left {
        margin-bottom: 10px;
    }
}
</style>