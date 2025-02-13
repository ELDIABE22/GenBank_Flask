let form = document.getElementById('form-login');
let cc = document.getElementById('cc');
let password = document.getElementById('password');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        cc: cc.value,
        password: password.value,
    };

    fetch('/api/v1/auth/login', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then(data => console.log(data))
})