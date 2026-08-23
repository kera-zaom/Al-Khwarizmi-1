"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {
        console.error("Supabase غير متصل");
        return;
    }

    try {

        // =========================
        // الحصول على المستخدم
        // =========================

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            location.href = "auth.html";
            return;
        }


        // =========================
        // بيانات الطالب فقط
        // =========================

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select(`
                id,
                full_name,
                phone,
                parent_phone,
                grade,
                city,
                school,
                governorate,
                photo_url
            `)
            .eq("id", user.id)
            .maybeSingle();


        if (studentError) {

            console.error(
                "Student Error:",
                studentError
            );

            showError(
                "تعذر تحميل بيانات الطالب."
            );

            return;
        }


        if (!student) {

            showError(
                "بيانات الطالب غير موجودة."
            );

            return;
        }


        // =========================
        // الاسم
        // =========================

        const studentName =
            document.getElementById("studentName");

        if (studentName) {
            studentName.textContent =
                student.full_name || "الطالب";
        }


        // =========================
        // الصف
        // =========================

        const studentGrade =
            document.getElementById("studentGrade");

        if (studentGrade) {
            studentGrade.textContent =
                student.grade || "غير محدد";
        }


        // =========================
        // المدينة
        // =========================

        const studentCity =
            document.getElementById("studentCity");

        if (studentCity) {
            studentCity.textContent =
                student.city || "";
        }


        // =========================
        // المدرسة
        // =========================

        const studentSchool =
            document.getElementById("studentSchool");

        if (studentSchool) {
            studentSchool.textContent =
                student.school || "";
        }


        // =========================
        // الصورة
        // =========================

        const studentPhoto =
            document.getElementById("studentPhoto");

        if (
            studentPhoto &&
            student.photo_url
        ) {
            studentPhoto.src =
                student.photo_url;
        }


        // =========================
        // زر الاختبارات
        // =========================

        const testsBtn =
            document.getElementById("testsBtn");

        if (testsBtn) {

            testsBtn.addEventListener(
                "click",
                () => {
                    location.href =
                        "tests.html";
                }
            );

        }


        // =========================
        // تسجيل الخروج
        // =========================

        const logoutBtn =
            document.getElementById("logoutBtn");

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async () => {

                    logoutBtn.disabled = true;

                    await supabaseClient.auth.signOut();

                    location.href =
                        "auth.html";

                }
            );

        }


        console.log(
            "Home loaded successfully"
        );

    } catch (error) {

        console.error(
            "HOME ERROR:",
            error
        );

        showError(
            "حدث خطأ أثناء تحميل الصفحة."
        );

    }


    function showError(message) {

        const errorElement =
            document.getElementById("errorMessage");

        if (errorElement) {

            errorElement.textContent =
                message;

            errorElement.style.display =
                "block";

        } else {

            console.error(message);

        }

    }

});
