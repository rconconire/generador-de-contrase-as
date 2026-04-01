// 1. DOM Elements
const passwordResult = document.getElementById('password-result');
const lengthSlider = document.getElementById('length-slider');
const lengthDisplay = document.getElementById('length-display');

const uppercaseCb = document.getElementById('uppercase-cb');
const lowercaseCb = document.getElementById('lowercase-cb');
const numbersCb = document.getElementById('numbers-cb');
const symbolsCb = document.getElementById('symbols-cb');

const btnGenerate = document.getElementById('generate-btn');
const btnCopy = document.getElementById('copy-btn');
const btnToggleVisibility = document.getElementById('toggle-visibility-btn');
const iconEyeOpen = document.getElementById('icon-eye-open');
const iconEyeClosed = document.getElementById('icon-eye-closed');

const strengthText = document.getElementById('strength-text');
const strengthBars = [
    document.getElementById('bar-1'),
    document.getElementById('bar-2'),
    document.getElementById('bar-3'),
    document.getElementById('bar-4'),
    document.getElementById('bar-5'),
    document.getElementById('bar-6'),
    document.getElementById('bar-7'),
    document.getElementById('bar-8'),
    document.getElementById('bar-9'),
    document.getElementById('bar-10')
];
const toastContainer = document.getElementById('toast-container');


// 2. Arrays de Caracteres
const CHARS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};


// 3. Event Listeners Init
function init() {
    // Actualizar numero de longitud
    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
    });

    // Generar contraseña
    btnGenerate.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir default siempre
        generatePassword();
    });

    // Copiar al portapapeles
    btnCopy.addEventListener('click', (e) => {
        e.preventDefault();
        copyToClipboard();
    });

    // Mostrar/Ocultar contraseña
    btnToggleVisibility.addEventListener('click', (e) => {
        e.preventDefault();
        togglePasswordVisibility();
    });

    // Generar la inicial
    generatePassword();
}


// 4. Lógica de Generación de Contraseña
function generatePassword() {
    let charset = '';
    const length = parseInt(lengthSlider.value, 10);
    
    const typesCount = uppercaseCb.checked + lowercaseCb.checked + numbersCb.checked + symbolsCb.checked;

    // Verificar que al menos uno esté seleccionado. 
    // Si ninguno está seleccionado agregamos toast visual que lo indique.
    if (typesCount === 0) {
        showToast('Debes seleccionar al menos una opción');
        passwordResult.value = '';
        updateStrengthIndicator(0);
        return;
    }

    if (uppercaseCb.checked) charset += CHARS.uppercase;
    if (lowercaseCb.checked) charset += CHARS.lowercase;
    if (numbersCb.checked) charset += CHARS.numbers;
    if (symbolsCb.checked) charset += CHARS.symbols;

    let finalPassword = '';
    
    // Asegurarnos de usar un RNG de calidad (si fuera necesario algo robusto). Math.random es suficiente pero crypto es mejor.
    // Usamos crypto.getRandomValues para mejorar la seguridad antihacking si está disponible
    if (window.crypto && window.crypto.getRandomValues) {
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            finalPassword += charset[randomValues[i] % charset.length];
        }
    } else {
        // Fallback en caso remoto de no tener crypto API
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            finalPassword += charset[randomIndex];
        }
    }

    passwordResult.value = finalPassword;
    
    // Evaluar y mostrar la fuerza de la contraseña generada
    calculateStrength(length, typesCount);
}


// 5. Ocultar y Mostrar Contraseña
function togglePasswordVisibility() {
    if (passwordResult.type === 'password') {
        passwordResult.type = 'text';
        iconEyeClosed.style.display = 'none';
        iconEyeOpen.style.display = 'block';
    } else {
        passwordResult.type = 'password';
        iconEyeClosed.style.display = 'block';
        iconEyeOpen.style.display = 'none';
    }
}


// 6. Copiado al Portapapeles con visual feedback
function copyToClipboard() {
    const password = passwordResult.value;
    
    if (!password) {
        showToast('No hay contraseña para copiar');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        showToast('¡Copiado!');
    }).catch(err => {
        showToast('Error al copiar');
        console.error('Copy Failed', err);
    });
}

// Emplear DOM Manipulation pura para el toast
function showToast(message) {
    const toastElem = document.createElement('div');
    toastElem.className = 'toast';
    toastElem.textContent = message;      // Usar textContent y no innerHTML

    toastContainer.appendChild(toastElem);

    // Remover del dom despues de animacion
    setTimeout(() => {
        if(toastContainer.contains(toastElem)) {
            toastContainer.removeChild(toastElem);
        }
    }, 2500);
}


// 7. Lógica de Fortaleza de la Contraseña (Escala de 1 a 10)
function calculateStrength(length, typesCount) {
    let score = 0;

    // Fórmula base
    if (typesCount > 0) score += typesCount;

    // Bono por longitud
    if (length >= 8) score += 1;
    if (length >= 10) score += 1;
    if (length >= 12) score += 1;
    if (length >= 14) score += 1;
    if (length >= 16) score += 1;
    if (length >= 20) score += 1;

    // Penalizaciones o Tapas máximas de seguridad
    // - Si solo usa 1 tipo de carácter (ej. solo números), no puede ser más de nivel 2.
    if (typesCount === 1) score = Math.min(score, 2);
    // - Si usa 2 tipos, máximo nivel 4.
    if (typesCount === 2) score = Math.min(score, 4);
    // - Si usa 3 tipos, máximo nivel 7.
    if (typesCount === 3) score = Math.min(score, 7);

    // Asegurarse de no exceder 10
    score = Math.min(score, 10);
    
    updateStrengthIndicator(score);
}

function updateStrengthIndicator(score) {
    // Limpiar clases
    strengthBars.forEach(bar => {
        bar.classList.remove('very-weak', 'weak', 'medium', 'strong');
    });
    strengthText.textContent = '';

    if (score === 0) return;

    let text = '';
    let cssClass = '';

    if (score <= 2) {
        text = 'Muy Débil';
        cssClass = 'very-weak';
    } else if (score <= 4) {
        text = 'Débil';
        cssClass = 'weak';
    } else if (score <= 7) {
        text = 'Media';
        cssClass = 'medium';
    } else {
        text = 'Fuerte';
        cssClass = 'strong';
    }

    strengthText.textContent = text;
    for (let i = 0; i < score; i++) {
        strengthBars[i].classList.add(cssClass);
    }
}


// Arrancar la app
init();
