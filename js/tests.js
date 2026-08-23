"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const supabaseClient =
        window.supabaseClient;

    if (!supabaseClient) {
        showError("Supabase غير متصل.");
        return;
    }

    const loading =
        document.getElementById("loading");

    const empty =
        document.getElementById("empty");

    const errorBox =
        document.getElementById("error");

    const grid =
        document.getElementById("testsGrid");

    const gradeElement =
        document.getElementById("studentGrade");


    // ==========================================
    // المستخدم الحالي
    // ==========================================

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) {
        location.href = "auth.html";
        return;
    }


    // ==========================================
    // بيانات الطالب
    // ==========================================

    const {
        data: student,
        error: studentError
    } =
        await supabaseClient
            .from("students")
            .select("full_name, grade")
            .eq("id", user.id)
            .maybeSingle();


    if (studentError) {
        showError(studentError.message);
        return;
    }


    if (!student) {
        showError("لم يتم العثور على بيانات الطالب.");
        return;
    }


    gradeElement.textContent =
        `الصف: ${student.grade || "غير محدد"}`;


    // ==========================================
    // الاختبارات
    // ==========================================

    let query =
        supabaseClient
            .from("exams")
            .select(`
                id,
                title,
                description,
                grade,
                duration_minutes,
                teacher_id
            `)
            .eq("is_active", true);


    // عرض اختبارات صف الطالب فقط
    if (student.grade) {

        query =
            query.eq(
                "grade",
                student.grade
            );

    }


    const {
        data: exams,
        error: examsError
    } = await query.order(
        "created_at",
        {
            ascending: false
        }
    );


    loading.style.display = "none";


    if (examsError) {
        showError(examsError.message);
        return;
    }


    if (!exams || exams.length === 0) {

        empty.style.display = "block";
        return;

    }


    // ==========================================
    // عرض الاختبارات
    // ==========================================

    grid.innerHTML = "";

    exams.forEach(exam => {

        const card =
            document.createElement("div");

        card.className = "card";


        const title =
            escapeHTML(exam.title);


        const description =
            escapeHTML(
                exam.description ||
                "اختبار رياضيات"
            );


        card.innerHTML = `

            <h2>${title}</h2>

            <div class="description">
                ${description}
            </div>

            <div class="info">

                <span class="badge">
                    ⏱ ${exam.duration_minutes} دقيقة
                </span>

                <span class="badge">
                    📚 ${escapeHTML(exam.grade)}
                </span>

            </div>

            <button
                class="start"
                data-id="${exam.id}"
            >
                بدء الاختبار
            </button>

        `;


        const button =
            card.querySelector(".start");


        button.addEventListener(
            "click",
            () => {

                location.href =
                    `exam.html?id=${encodeURIComponent(exam.id)}`;

            }
        );


        grid.appendChild(card);

    });


    // ==========================================
    // HELPERS
    // ==========================================

    function showError(message) {

        loading.style.display = "none";

        errorBox.style.display = "block";

        errorBox.textContent =
            message;

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});