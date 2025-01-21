/*!
=========================================================
* Meyawo Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});

// navbar toggle
$('#nav-toggle').click(function(){
    $(this).toggleClass('is-active')
    $('ul.nav').toggleClass('show');
});

document.addEventListener('scroll', function () {
    const scrollDownElement = document.querySelector('.scroll-down');

    // ตรวจสอบว่าผู้ใช้เลื่อนลงเกิน 50px หรือไม่
    if (window.scrollY > 50) {
        scrollDownElement.classList.add('hide'); // เพิ่มคลาส "hide"
    } else {
        scrollDownElement.classList.remove('hide'); // เอาคลาส "hide" ออก
    }
});

let prevScrollPos = window.pageYOffset;  // เก็บตำแหน่ง scroll ก่อนเปิดโมดัล


function openModal(id, title, description, imgSrc) {
    // แสดงโมดัล
    document.getElementById("portfolioModal").style.display = "block";
    document.getElementById("modal-img").src = imgSrc;
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = description;

    // เพิ่ม class เพื่อให้ header จางลง
    document.querySelector("header").classList.add("transparent");

    // ป้องกันการเลื่อนหน้าเมื่อเปิดโมดัล
    document.body.classList.add("modal-open");

    // บันทึกตำแหน่ง scroll ก่อนเปิดโมดัล
    prevScrollPos = window.pageYOffset;
    // ซ่อนไม่ให้เลื่อนหน้า
    document.documentElement.style.scrollBehavior = "auto";
}

function closeModal() {
    // ซ่อนโมดัล
    document.getElementById("portfolioModal").style.display = "none";
    
    // ลบ class ออกจาก header เพื่อให้กลับสู่ปกติ
    document.querySelector("header").classList.remove("transparent");

    // เปิดการเลื่อนหน้าอีกครั้ง
    document.body.classList.remove("modal-open");

    // คืนค่าตำแหน่ง scroll ไปที่ตำแหน่งเดิม
    window.scrollTo(0, prevScrollPos);
    // คืนการตั้งค่า scroll behavior เพื่อให้หน้าเลื่อนอย่างปกติ
    document.documentElement.style.scrollBehavior = "smooth";
}

function openModal() {
    var modal = document.querySelector('.modal');
    modal.style.display = 'flex'; // แสดง modal
    document.body.classList.add('modal-open'); // เพิ่มคลาส modal-open เพื่อเลื่อน navbar ขึ้น
    document.body.style.overflow = 'hidden'; // ปิดการเลื่อนของ body ขณะเปิด modal
}

function closeModal() {
    var modalContent = document.querySelector('.modal-content');
    modalContent.classList.add('closed'); // เพิ่มคลาสสำหรับอนิเมชั่นการปิด

    // หลังจากอนิเมชั่นเสร็จสิ้น
    setTimeout(function () {
        var modal = document.querySelector('.modal');
        modal.style.display = 'none'; // ซ่อน modal
        document.body.classList.remove('modal-open'); // ลบคลาส modal-open เพื่อคืนค่า navbar
        document.body.style.overflow = 'auto'; // เปิดการเลื่อนของ body อีกครั้ง
    }, 500); // เวลารอให้อนิเมชั่นเสร็จ (0.5 วินาที)
}
function openModal(type, title, description, imageUrl) {
    const modal = document.getElementById("portfolioModal");
    const modalImage = document.getElementById("modalImage");
    const modalTitle = document.getElementById("modalTitle");
    const modalText = document.getElementById("modalText");

    modalImage.src = imageUrl;
    modalTitle.textContent = title;
    modalText.textContent = description;

    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("portfolioModal");
    modal.style.display = "none";
}

function handleOutsideClick(event) {
    const modal = document.querySelector('div#portfolioModal:nth-of-type(2)');  // เลือก Modal ที่ 2
    const modalContent = modal.querySelector('.modal-content');  // เลือก .modal-content ภายใน Modal ที่ 2
    
    // ถ้าคลิกนอก .modal-content ของ Modal ที่ 2 ให้ปิด Modal นี้
    if (!modalContent.contains(event.target) && modal.style.display === 'flex') {
        closeModal();
    }
}



function handleOutsideClick(event) {
    const modalContent = document.querySelector('.modal-content');
    
    // ถ้าคลิกใน .modal-background และไม่คลิกใน .modal-content
    if (!modalContent.contains(event.target)) {
        closeModal();
    }
}

const dinosaur = document.querySelector('.dinosaur');
let xPos = Math.random() * (window.innerWidth - 50); // Initial random x position
let yPos = Math.random() * (window.innerHeight - 50); // Initial random y position
let xSpeed = (Math.random() - 0.5) * 5; // Random speed for x direction
let ySpeed = (Math.random() - 0.5) * 5; // Random speed for y direction

function animate() {
  // Update positions
  xPos += xSpeed;
  yPos += ySpeed;

  // Check for collisions with the screen edges
  if (xPos <= 0 || xPos >= window.innerWidth - 50) {
    xSpeed = -xSpeed; // Reverse direction on horizontal collision (left/right)
  }

  if (yPos <= 0 || yPos >= window.innerHeight - 50) {
    ySpeed = -ySpeed; // Reverse direction on vertical collision (top/bottom)
  }

  // Apply the new position
  dinosaur.style.left = `${xPos}px`;
  dinosaur.style.top = `${yPos}px`;

  // Request the next frame for smooth animation
  requestAnimationFrame(animate);
}

// Start the animation
animate();
