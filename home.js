(function () {

    "use strict";

    let offerButton = null;
    let offerContent = null;
    let bestGrid = null;

    /*
    ==========================================
    عند تحميل الصفحة
    ==========================================
    */

    document.addEventListener("DOMContentLoaded", function () {

        offerButton =
            document.getElementById("offerButton");

        offerContent =
            document.getElementById("offerContent");

        bestGrid =
            document.getElementById("bestStudentsGrid");


        /*
        ==========================================
        التأكد من وجود العناصر
        ==========================================
        */

        if (!offerButton) {
            console.error(
                "❌ لم يتم العثور على offerButton"
            );
        }

        if (!offerContent) {
            console.error(
                "❌ لم يتم العثور على offerContent"
            );
        }

        if (!bestGrid) {
            console.error(
                "❌ لم يتم العثور على bestStudentsGrid"
            );
        }


        /*
        ==========================================
        زر ماذا نقدم
        ==========================================
        */

        if (offerButton && offerContent) {

            offerButton.addEventListener(
                "click",
                handleOfferClick
            );

        }

    });


    /*
    ==========================================
    فتح / إغلاق ماذا نقدم
    ==========================================
    */

    async function handleOfferClick() {

        if (!offerContent || !offerButton) {
            return;
        }


        const isOpen =
            offerContent.classList.contains("show");


        /*
        ==========================================
        إغلاق
        ==========================================
        */

        if (isOpen) {

            offerContent.classList.remove(
                "show"
            );

            offerButton.innerHTML =
                "✨ ماذا نقدم لكم؟";

            return;

        }


        /*
        ==========================================
        فتح
        ==========================================
        */

        offerContent.classList.add(
            "show"
        );

        offerButton.innerHTML =
            "🔽 ماذا نقدم لكم";


        /*
        تحميل أفضل الطلاب
        */

        await loadBestStudents();


        /*
        النزول للقسم
        */

        setTimeout(function () {

            offerContent.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    }


    /*
    ==========================================
    جلب أفضل الطلاب
    ==========================================
    */

    async function loadBestStudents() {

        if (!bestGrid) {
            return;
        }


        /*
        ==========================================
        التأكد من Supabase
        ==========================================
        */

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            showError(
                "Supabase غير متصل."
            );

            return;

        }


        /*
        ==========================================
        Loading
        ==========================================
        */

        bestGrid.innerHTML = `

            <div class="best-loading">

                ⏳ جاري تحميل أفضل الطلاب...

            </div>

        `;


        try {

            /*
            ======================================
            طلب البيانات
            ======================================
            */

            const response =
                await supabaseClient
                    .from("students")
                    .select(
                        "id, full_name, points, avatar_url"
                    )
                    .order(
                        "points",
                        {
                            ascending: false,
                            nullsFirst: false
                        }
                    )
                    .limit(10);


            const data =
                response.data;

            const error =
                response.error;


            /*
            ======================================
            خطأ Supabase
            ======================================
            */

            if (error) {

                console.error(
                    "❌ Supabase Error:",
                    error
                );

                showError(
                    "تعذر تحميل أفضل الطلاب."
                );

                return;

            }


            /*
            ======================================
            لا يوجد طلاب
            ======================================
            */

            if (
                !data ||
                data.length === 0
            ) {

                bestGrid.innerHTML = `

                    <div class="best-empty">

                        🏆 لا يوجد طلاب لديهم نقاط
                        حتى الآن.

                    </div>

                `;

                return;

            }


            /*
            ======================================
            عرض الطلاب
            ======================================
            */

            renderStudents(data);

        }

        catch (error) {

            console.error(
                "❌ Error:",
                error
            );

            showError(
                "حدث خطأ أثناء تحميل أفضل الطلاب."
            );

        }

    }


    /*
    ==========================================
    عرض الطلاب
    ==========================================
    */

    function renderStudents(students) {

        if (!bestGrid) {
            return;
        }


        bestGrid.innerHTML = "";


        students.forEach(
            function (student, index) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "student-card";


                /*
                تأخير الأنيميشن
                */

                card.style.animationDelay =
                    (index * 0.10) + "s";


                /*
                المركز
                */

                const rank =
                    index + 1;


                /*
                الاسم
                */

                const name =
                    escapeHTML(
                        student.full_name ||
                        "طالب"
                    );


                /*
                النقاط
                */

                const points =
                    Number(
                        student.points || 0
                    );


                /*
                الصورة
                */

                const avatar =
                    createAvatar(
                        student.avatar_url,
                        name
                    );


                /*
                ==================================
                HTML الطالب
                ==================================
                */

                card.innerHTML = `

                    <div class="student-rank">

                        ${getRankIcon(rank)}

                    </div>


                    <div class="student-avatar">

                        ${avatar}

                    </div>


                    <div class="student-name">

                        ${name}

                    </div>


                    <div class="student-points">

                        ⭐ ${points} نقطة

                    </div>

                `;


                bestGrid.appendChild(
                    card
                );

            }
        );

    }


    /*
    ==========================================
    إنشاء صورة الطالب
    ==========================================
    */

    function createAvatar(url, name) {

        /*
        لو مفيش صورة
        */

        if (
            !url ||
            String(url).trim() === ""
        ) {

            return `

                <div class="student-emoji">

                    🎓

                </div>

            `;

        }


        const safeURL =
            escapeAttribute(url);


        const safeName =
            escapeAttribute(name);


        return `

            <img

                src="${safeURL}"

                alt="${safeName}"

                loading="lazy"

                onerror="
                    this.style.display='none';
                    if(this.nextElementSibling){
                        this.nextElementSibling.style.display='flex';
                    }
                "

            >

            <div
                class="student-emoji"
                style="display:none;"
            >

                🎓

            </div>

        `;

    }


    /*
    ==========================================
    المراكز
    ==========================================
    */

    function getRankIcon(rank) {

        switch (rank) {

            case 1:
                return "🥇";

            case 2:
                return "🥈";

            case 3:
                return "🥉";

            default:
                return rank;

        }

    }


    /*
    ==========================================
    رسالة الخطأ
    ==========================================
    */

    function showError(message) {

        if (!bestGrid) {
            return;
        }


        bestGrid.innerHTML = `

            <div class="best-error">

                ❌ ${escapeHTML(message)}

            </div>

        `;

    }


    /*
    ==========================================
    حماية HTML
    ==========================================
    */

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /*
    ==========================================
    حماية Attribute
    ==========================================
    */

    function escapeAttribute(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            );

    }


    /*
    ==========================================
    جعل الدالة متاحة للصفحة
    ==========================================
    */

    window.toggleOffers = handleOfferClick;

    window.loadBestStudents =
        loadBestStudents;


})();