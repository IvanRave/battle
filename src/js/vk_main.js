$(function () {
    auth({
        login_on_done: set_after_auth,
        login_progress: 1
    });
    set_drag();

    try {
        VK.init(function () {
            $("#friends_invite_link").on("click", function () { VK.callMethod("showInviteBox"); });

            VK.Widgets.Like("vk_like", { type: "button", width: 180, pageTitle: 'Баттл Естественный', pageDescription: 'Текстовый баттл. Аудиобаттл. Каталог битов. Принять участие можно в любой момент.', pageUrl: 'https://vk.com/app2644762', height: 20 });
            VK.Widgets.Group("vk_group_news", { mode: 2, width: "480", height: "600", wide: 1 }, 31257938);
            VK.Widgets.Comments("vk_battle_chat", { limit: 1, width: "480", height: "600", autoPublish: 0, attach: false, pageURL: "https://vk.com/app2644762" }, 8642);
            VK.addCallback('onOrderSuccess', function (order_id) {
                update_balance_string();
            });
        });    
    }
    catch (e) {
        console.log(e);
    }
    battleplayer = new MediaElementPlayer("#battleplayer", {
        success: function (mediaElement, domObject) {
            //mediaElement.play();
            get_track_from_wall();
            //get_main_track();
        }
    });
    

    var p = $('.popup__overlay');
    $('.popup__overlay').on("click", function (pov) {
        var e = pov || window.event;
        if (e.target == this) {
            $('.popup__overlay').hide();
        }
    });
    //   console.log($('*').length);
});