window.addEventListener('DOMContentLoaded', (event) => {
    const img = document.getElementById('hoverImage');

    img.addEventListener('mouseover', function() {
        img.src = 'assets/imgs/icons8-python.gif';  // เปลี่ยนภาพเมื่อ hover
    });

    img.addEventListener('mouseout', function() {
        img.src = 'assets/imgs/icons8-python.svg';  // เปลี่ยนกลับเมื่อเลิก hover
    });
});

window.addEventListener('DOMContentLoaded', (event) => {
    const img = document.getElementById('hoverImage_java');

    img.addEventListener('mouseover', function() {
        img.src = 'assets/imgs/icons8-java.gif';  // เปลี่ยนภาพเมื่อ hover
    });

    img.addEventListener('mouseout', function() {
        img.src = 'assets/imgs/icons8-java.svg';  // เปลี่ยนกลับเมื่อเลิก hover
    });
});
