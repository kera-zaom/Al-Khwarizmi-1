"use strict";

window.ADMIN_AUTH = {

    client: null,
    user: null,

    async init() {

        // الحصول على Supabase
        if (!window.supabaseClient) {
            throw new Error(
                "Supabase غير متصل. تأكد من ../supabase.js"
            );
        }

        this.client = window.supabaseClient;


        // الحصول على الجلسة
        const {
            data,
            error
        } = await this.client.auth.getSession();


        if (error) {
            throw error;
        }


        if (
            !data ||
            !data.session ||
            !data.session.user
        ) {

            window.location.replace(
                "../auth.html"
            );

            return false;
        }


        this.user =
            data.session.user;


        console.log(
            "CURRENT ADMIN:",
            this.user.id
        );


        // التحقق من الدور
        const {
            data: role,
            error: roleError
        } = await this.client
            .from("user_roles")
            .select("role")
            .eq(
                "user_id",
                this.user.id
            )
            .maybeSingle();


        if (roleError) {
            throw roleError;
        }


        if (
            !role ||
            role.role !== "admin"
        ) {

            throw new Error(
                "الحساب الحالي ليس Admin"
            );
        }


        console.log(
            "ADMIN VERIFIED"
        );


        return true;
    },


    async logout() {

        if (this.client) {

            await this.client.auth.signOut();

        }

        window.location.replace(
            "../auth.html"
        );
    }
};
