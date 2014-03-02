var chatHubClient;

var battleplayer;

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0, max_i = this.length; i < max_i; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

function get_date_from_json(in_data, no_need_time) {
    if (no_need_time === true) {
        return moment(in_data).format('DD.MM.YYYY');
    }
    else {
        return moment(in_data).format('DD.MM.YYYY hh:mm:ss');
    }
    ////if (in_data) {
    ////    var now = new Date(parseInt(in_data.substr(6), 10));
    ////    return get_date_in_need_format(now, no_need_time);
    ////}
    ////return null;
}

////function get_date_in_need_format(now, no_need_time) {
////    var zeros = ['00', '0', ''];
////    var day = String(now.getDate());
////    var month = String(now.getMonth() + 1);
////    var dt = zeros[day.length] + day + "." + zeros[month.length] + month + "." + now.getFullYear();
////    if (!no_need_time) { dt = dt + ' ' + now.toLocaleTimeString(); }
////    return dt;
////}

function fromOAtoJS(dateFloat) {
    var jsDate = new Date();
    jsDate.setTime((parseFloat(dateFloat) - 25569) * 24 * 3600 * 1000);
    return jsDate;
}

function get_part_url(needPart) {
    var parts = document.location.search.substr(1).split("&");
    var flashVars = {};
    var curr;
    for (var i = 0; i < parts.length; i++) {
        curr = parts[i].split('=');
        flashVars[curr[0]] = curr[1];
    }
    return flashVars[needPart];
}

function popup_msg(popupTitle, popupContent) {
    $('#popup_header').html(popupTitle);
    $('#popup_content').html(popupContent);
    $('.popup__overlay').show();
}

function simple_tooltip(target_items, name) {
    $(target_items).each(function (i) {
        $("body").append("<div class='" + name + "' id='" + name + i + "'><p>" + $(this).attr('title') + "</p></div>");
        var my_tooltip = $("#" + name + i);

        $(this).removeAttr("title").mouseover(function () {
            my_tooltip.css({ opacity: 0.8, display: "none" }).fadeIn(400);
        }).mousemove(function (kmouse) {
            my_tooltip.css({ left: kmouse.pageX + 15, top: kmouse.pageY + 15 });
        }).mouseout(function () {
            my_tooltip.fadeOut(400);
        });
    });
}

// Request to server
function ajaxRequest(mthd, jd, options) { // Ajax helper
    if (!options) { options = {}; }
    // options = {cache, progress }
    // options.shared has been removed (all methods moved to web api)

    if (options.progress) {
        $('.spinner').show();
    }

    var ajaxOptions = {
        cache: (options.cache) ? true : false,
        async: true,
        type: options.requestType ? options.requestType : "POST",
        data: (jd ? JSON.stringify(jd) : null)
    };

    var requestUrl = '';
    if (mthd.substr(0, 5) === '/api/') {
        requestUrl = mthd;
    }
    else {
        requestUrl = "/wservice/wcfbase.svc/" + mthd;
        // set contentType for WCF services
        ajaxOptions.contentType = "application/json;charset=utf-8";
    }

    return $.ajax('{{conf.reqUrl}}' + requestUrl, ajaxOptions).always(function () {
        if (options.progress) {
            $('.spinner').hide();
        }
    });
}

var battle_types = {
    text_battle: {
        battle_name: 'текстовый баттл',
        battle_name_short: 'текстовый',
        icon_name: 'align-left',
        battle_desc: 'сочинение, оценка, рейтинг текстов ',
        menu_color: '#369',
        menu_attr: {
            0: { menu_title: 'Мой текст', menu_function: text_battle_creation, menu_name: 'creation' },
            1: { menu_title: 'Оценка', menu_function: text_battle_judging, menu_name: 'judging' },
            2: { menu_title: 'Рейтинг', menu_function: text_battle_rating, menu_name: 'rating' }
        },
        top_users: ['19064903', '33608228', '3851592', '4509585'],
        battle_group_id: 31257938,
        round_album_id: 0,
        ocn: {
            rhyme: { oname: "Техника написания", odesc: "Приёмы текстового дизайна: рифмы, созвучия, читабельность текста", qstars: 10 },
            theme: { oname: "Раскрытие темы", odesc: "Соблюдение заданной темы, осмысленность текста", qstars: 10 },
            general: { oname: "Общее впечатление", odesc: "", qstars: 5 }
        }
    },
    audio_battle: {
        battle_name: 'аудиобаттл',
        battle_name_short: 'аудио',
        icon_name: 'music',
        battle_desc: 'запись, оценка, рейтинг треков',
        menu_color: '#639',
        menu_attr: {
            0: { menu_title: 'Мой трек', menu_function: audio_battle_creation, menu_name: 'creation' },
            1: { menu_title: 'Оценка', menu_function: audio_battle_judging, menu_name: 'judging' },
            2: { menu_title: 'Рейтинг', menu_function: audio_battle_rating, menu_name: 'rating' }
        },
        top_users: [],
        battle_group_id: 31257938,
        round_album_id: 29411469,
        ocn: {
            rhyme: { oname: "Техника", odesc: "Мастерство речитатива + стилизация текста", qstars: 10 },
            theme: { oname: "Текст", odesc: "Осмысленность текста", qstars: 10 },
            general: { oname: "Общее впечатление", odesc: "", qstars: 5 }
        }
    },
    beat_battle: {
        battle_name: 'битмейкер-баттл',
        battle_name_short: 'битмейкер',
        icon_name: 'headphones',
        battle_desc: 'оценка, рейтинг, каталог битов',
        menu_color: '#939',
        menu_attr: {
            0: { menu_title: 'Мой бит', menu_function: beat_battle_creation, menu_name: 'creation' },
            1: { menu_title: 'Оценка', menu_function: beat_battle_judging, menu_name: 'judging' },
            2: { menu_title: 'Рейтинг', menu_function: beat_battle_rating, menu_name: 'rating' }
        },
        top_users: [],
        battle_group_id: 33368159,
        round_album_id: 29863296,
        ocn: {
            rhyme: { oname: "Аранжировка, сведение", odesc: "правильное сведение, приятное на слух звучание, атмосфера трека и т.д", qstars: 10 },
            theme: { oname: "Креативность написания", odesc: "использование оригинальных приёмов, начиная от голосовых эффектов, заканчивая перебитовкой или сменой ударных", qstars: 10 },
            general: { oname: "Общее впечатление", odesc: "", qstars: 5 }
        }
    }
};

var user_author = {
    nick_name: {
        value: '',
        label: 'Ник исполнителя (автора)',
        desc: 'User nick',
        maxlength: 30,
        minlength: 2
    },
    beatmaker_name: {
        value: '',
        label: 'Ник битмейкера (production)',
        desc: 'SomeBeats production',
        maxlength: 30,
        minlength: 2
    },
    group_name: {
        value: '',
        label: 'Группа',
        desc: 'группа, объединение',
        maxlength: 30,
        minlength: 2
    },
    biography: {
        value: '',
        label: 'О себе',
        desc: 'Краткая биография',
        maxlength: 800,
        minlength: 2
    }
};

var user_statuses = {
    text_battle_status_max: 128,
    text_battle_uch_status: null,
    is_status_in_top: false
};

var status_arr = {
    128: { sname: 'отбор', is_top: false },
    64: { sname: '1/32', is_top: false },
    32: { sname: '1/16', is_top: false },
    16: { sname: '1/8', is_top: true },
    8: { sname: '1/4', is_top: true },
    4: { sname: '1/2', is_top: true },
    2: { sname: 'финал', is_top: true },
    1: { sname: 'победитель', is_top: false }
};

function sys_msg_show(msg_code, function_name) {
    if (!msg_code || msg_code === null) { msg_code = 99; }
    //try send error to server with msg_text, function_name, browserinfo
    var msg_json = {
        1: 'Неверный вход',
        2: 'Ошибка входа. Попробуйте позже.',
        4001: 'Произошла ошибка получения темы раунда. Обратитесь к администрации.',
        99: 'Произошла ошибка сценария. Cохраните необходимые данные и обновите страницу'
    };
    $('#system_msg').html(msg_json[msg_code] ? msg_json[msg_code] : msg_json[99]).show();
}

function event_msg_show(msg_text) {
    var arg_length = arguments.length;
    if (arg_length === 0) { sys_msg_show(); return; }

    var cancel_span = document.createElement("span");
    $(cancel_span).on("click", function () {
        $("#event_msg_block").hide();
    }).addClass("cancel_event_msg").addClass("link_view").html("закрыть");
    var inner_p = document.createElement('p');
    $('#event_msg_block').html(inner_p).prepend(cancel_span).show();

    for (var i = 0; i < arg_length; i++) {
        $(inner_p).append(arguments[i]);
    }
}

var btl_event = {
    current_round_id: null
};

function hide_all_block() {
    $("#cabinet").hide();
    $("#battle_description").hide();
    $("#material_container").hide();
    $(".ext_text_battle").hide();
    $(".ext_audio_battle").hide();
    $(".ext_beat_battle").hide();
    $("#event_msg_block").empty().hide();
    //$("#track_recipe").hide();
}

function get_date_or_time(need_date, date_xor_time) {

    var now = new Date();
    var is_date_today = (now.toDateString() === need_date.toDateString());

    if (is_date_today) {
        return need_date.toLocaleTimeString();
    }
    else {
        var zeros = ['00', '0', ''];
        var day = String(need_date.getDate());
        var month = String(need_date.getMonth() + 1);
        return (zeros[day.length] + day + "." + zeros[month.length] + month + "." + need_date.getFullYear());
    }
}

function show_cabinet() {
    hide_all_block();
    $('#btl_list_sub').show();
    $('#cabinet').show();
    //$('#track_recipe').show();
    //load_rkl_blocks();
    zx.get_materials_ocen_counters();
}

var coord_dif = { dif_x: 0, dif_y: 0 };

function auth(login_options) {
    var viewer_id = get_part_url('viewer_id');
    if (!viewer_id) {
        sys_msg_show(1);
        return;
    }
    var auth_key = get_part_url('auth_key');
    if (!auth_key) {
        sys_msg_show(1);
        return;
    }

    var ref_group_id = get_part_url('group_id');
    var ref_user_id = get_part_url('user_id');
    var referrer = '';
    if (ref_group_id && (ref_group_id > 0)) {
        referrer = '-' + ref_group_id;
    }
    else if (ref_user_id && (ref_user_id > 0)) {
        if (viewer_id !== ref_user_id) {
            referrer = ref_user_id;
        }
    }

    var login_data_json = {
        viewer_id: 'v' + viewer_id,
        check_string: auth_key,
        referrer: referrer
    };

    $.ajax({
        cache: false,
        async: true,
        type: 'POST',
        dataType: 'json',
        xhrFields: {
             withCredentials: true
        },
        url: '{{conf.reqUrl}}/api/userprofile/',
        data: JSON.stringify(login_data_json),
        contentType: 'application/json;charset=utf-8'
    })
    .done(function (r) {
        if (r && r.islogin) {
            if (login_options && login_options.login_on_done) {
                login_options.login_on_done();
            }
            if (r.isfirsttime) {
                //  event_msg_show('Добро пожаловать! Выберите интересующий Вас баттл для дальнейшего участия.');
            }
        }
        else {
            // неверно указаны данные
            sys_msg_show(2);
        }
    })
    .fail(function (e) {
        sys_msg_show(2);
    });
}

function set_after_auth() {
    // Initiate the Knockout bindings
    ko.applyBindings(window.btlApp.viewModel);
    btlApp.viewModel.getBattleSeasonList();
    btlApp.viewModel.getCurrentUserProfile();

    $("#my_docs_block").show();
    show_cabinet();
    update_balance_string();
    setTimeout(zx.get_referrer_users, 30000);
}

function get_track_from_wall() {
    var offset_number = getRandomInt(0, 45);
    VK.api('wall.get', { owner_id: -31568224, offset: offset_number, count: 1 }, function (r) {
        if (!r.response) return;
        if (!r.response[1]) return;
        if (!r.response[1].attachment) return;
        if (!r.response[1].attachment.audio) return;

        var rap_phrase = r.response[1].text.replace(/<br>/g, " ");

        $("#hiphopplayer_title").html('<span style="font-weight:bold">' + r.response[1].attachment.audio.performer + '</span> - ' + r.response[1].attachment.audio.title);
        $("#hiphopplayer_title_note").html(rap_phrase);
        $("#hiphopplayer").show();
        $("#player_replacer").on("click", function () {
            var mcontent_json = {
                aids: r.response[1].attachment.audio.aid
            };

            if (r.response[1].attachment.audio.owner_id > 0) {
                mcontent_json.uid = r.response[1].attachment.audio.owner_id;
            }
            else {
                mcontent_json.gid = -parseInt(r.response[1].attachment.audio.owner_id, 10);
            }

            play_file_jquery(mcontent_json, "//vk.com/club31568224", null);
        });
    });
}


function getObjectFromHtmlString(htmlString, elemId) {
    var arr = $.grep($(htmlString), function (n) {
        return n.id === elemId;
    });

    return arr[0];
}

function update_balance_string() {
    btlApp.viewModel.getCurrentUserProfile();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var rkl_blocks = {
    hwcmusic: {
        title: 'Недорогие и бесплатные биты от команды битмейкеров',
        ex: '.png',
        gid: 34954759,
        width: 100,
        height: 100
    },
    gsb: {
        title: 'Ghetto Style Backhand production - Авторские минуса на заказ',
        ex: '.png',
        gid: 43729948,
        width: 100,
        height: 100
    },
    matrena: {
        title: 'Matrioshka production - авторские минуса на заказ, коллекция битов',
        ex: '.png',
        gid: 40325990,
        width: 100,
        height: 100
    },
    beatok: {
        title: 'BeatOK production - минуса в стиле RAP, R&B, CRUNK и т.п.',
        ex: '.png',
        gid: 24948347,
        width: 100,
        height: 100
    }
    //rhythmsofsoul: {
    //    title: 'Все кандидаты проходят отбор на вступление в лейбл',
    //    ex: '.png',
    //    gid: 27873846,
    //    width: 100,
    //    height: 100
    //}
    //,
    //hiphopcafe: {
    //    title: 'Новинки хип-хоп треков и клипов',
    //    ex: '.png',
    //    gid: 33847875,
    //    width: 100,
    //    height: 100
    //}


};


function load_rkl_blocks() {

    $("#rkl_div").css({ "text-align": "center", "border": "1px solid #DAE1E8" }).html(
        $('<div></div>').addClass('header-block-light').css({ 'padding': '8px' }).html('Партнёры'));
    for (var rkl in rkl_blocks) {
        var away_link_to = encodeURIComponent('//vk.com/club' + rkl_blocks[rkl].gid);
        var need_div = document.createElement("div");
        $(need_div).css({ "display": "inline-block", "margin": "8px" }).html(
            $('<a></a>').attr({ "href": 'away.ashx?to=' + away_link_to, "target": "blank" }).html(
                $('<img/>').attr({
                    "src": "Images/adimg/" + rkl + "_small" + rkl_blocks[rkl].ex,
                    "alt": rkl,
                    "title": rkl_blocks[rkl].title,
                    "id": rkl
                }).css({ "border": 0 })
            )
        );

        $("#rkl_div").append(need_div);
    }
}

function play_audio_judging(aid, player_number, battle_type) {
    VK.api("audio.get", { gid: battle_types[battle_type].battle_group_id, aids: aid }, function (r) {
        if (!r.response) {
            sys_msg_show();
            return;
        }
        if (r.response.length === 0) {
            event_msg_show('Пользователь снял свой трек с участия без уведомления администрации. Пожалуйста, перезапустите судейство');
            ajaxRequest("process_deleted_audio", { aid: aid, battle_type: battle_type }, {});
            return;
        }
        bj_play(null, { aid: r.response[0].aid, oid: r.response[0].owner_id }, r.response[0].url, null, r.response[0].artist, r.response[0].title, null, r.response[0].lyrics_id);
    });
}

function bj_copy_track(audio_add_data, artist, title) {
    if (audio_add_data) {
        VK.api("audio.add", audio_add_data, function (audio_add_r) {
            VK.api("audio.edit", { aid: audio_add_r.response, oid: get_part_url('viewer_id'), artist: decodeURIComponent(artist), title: (title ? decodeURIComponent(title) : ""), no_search: 0 }, function (audio_edit_response) {

            });
        });

        //if (oid == 33368159) {//beat battle - можно будет сделать еще для аудиобаттла (рейтинга)
        //    if (get_part_url('viewer_id') == 19064903) {
        //        VK.api("audio.get", { gid: oid, count: 1 }, function (r_beats) {
        //            if (r_beats.response.length > 0) {
        //                var url_data = {
        //                    oid: oid,
        //                    aid: aid,
        //                    after: 0,
        //                    before: r_beats.response[0].aid //самый первый трек в группе
        //                }
        //                VK.api("audio.reorder", { oid: url_data.oid, after: url_data.after, before: url_data.before, aid: url_data.aid }, function (rdr) { });
        //            }
        //        });
        //    }
        //}
    }
}

function set_drag() {
    if (window.event) {
        $('.show_window').attr('draggable', 'true').off()
        .on('dragstart', function (event) {
            coord_dif.dif_x = window.event.screenX;
            coord_dif.dif_y = window.event.screenY;
            event.originalEvent.dataTransfer.effectAllowed = 'move';
            event.originalEvent.dataTransfer.setData('Text', this.id);
        }).on('dragend', function (event) {
            $(this).css('left', parseInt($(this).css('left'), 10) + window.event.screenX - coord_dif.dif_x);
            $(this).css('top', parseInt($(this).css('top'), 10) + window.event.screenY - coord_dif.dif_y);
        });
    }
}




var beat_group_names = {
    33368159: [],
    32952439: ["http://vkontakte.ru/instrumental_s|"],
    27914325: ["РЭП МИНУС ОТ МЕГО ГРУППЫ http://vk.com/rep.minusa.club"],
    14537087: ["Бесплатный минус от команды FREETEAM [club14537087]", "Бесплатный минус от команды FREETEAM [vk.com/freeteam]"],
    9476578: ["[club9476578]", "www.klas-rap.com.ua"]
};

var beat_catalog_beatmaker_short = {
    38835614: { name: "Dark Side", album_id: 0 },
    39862017: { name: "Gekatomba", album_id: 0 },
    34954759: { name: "HWC Music", album_id: 0 },
    30650217: { name: "REMER beats", album_id: 0 },
    36553711: { name: "Постопам", album_id: 0 },
    10777453: { name: "Невовремя", album_id: 0 },
    26828767: { name: "Pun Beats", album_id: 0 },
    35359973: { name: "Donner Beats", album_id: 0 },
    32774028: { name: "Rom4eS", album_id: 0 },
    21361701: { name: "dB Six beats", album_id: 0 },
    23781697: { name: "Twenty-first Beat", album_id: 0 },
    32107703: { name: "Alien Beats", album_id: 0 },
    37912948: { name: "Dee.L", album_id: 0 },
    10226850: { name: "SLEEPY BIT", album_id: 0 },
    4745883: { name: "Beat Maker Tip", album_id: 0 },
    33322173: { name: "DeSpear Beats", album_id: 0 },
    32155712: { name: "BRAZARS BEATS", album_id: 22107152 },
    11569187: { name: "SWAGGABEAT", album_id: 14277398 },
    17008706: { name: "MasStudio", album_id: 0 },
    24948347: { name: "BeatOK", album_id: 0 },
    37734602: { name: "ZaeBeats", album_id: 0 },
    21079728: { name: "LAZY BEATS", album_id: 0 },
    27983808: { name: "Dijest", album_id: 0 },
    3202480: { name: "JamesBeat", album_id: 0 },
    38833504: { name: "Михалыч", album_id: 0 },
    32083093: { name: "Вольный Prod.", album_id: 20186929 },
    36632880: { name: "Insane Prod.", album_id: 0 }
};

function beat_catalog_show_beatmaker(needBlock) {
    //$('#out_window').show().focus();
    //$('#out_header_name').html("Битмейкеры");

    var using_rules_span = document.createElement('span');
    using_rules_span.appendChild(document.createTextNode("условия использования, размещение битов в каталоге"));
    $(using_rules_span).on('click', function () {
        $('#flow_window').show().focus();
        $('#flow_header_name').html(this.innerText);
        $('#flow_content').html($('#beat_catalog_using_rules').html());
    }).css("font-size", "10px").addClass("link_view");
    var using_rules_div = document.createElement('div');
    $(using_rules_div).css({ "text-align": "right", "padding-bottom": "2px" }).append(using_rules_span);

    $('#' + needBlock).html(using_rules_div);

    var inner_div = fill_div_beatmaker("beat_catalog_beatmaker_list");
    $(inner_div).css({ "margin-top": "4px" });

    $('#' + needBlock).append(inner_div);
}

function fill_div_beatmaker(inner_div_id) {
    var inner_div = document.createElement('div');
    inner_div.id = inner_div_id;
    $(inner_div).addClass("beat_makers_list");

    for (var bc in beat_catalog_beatmaker_short) {
        var beat_li = document.createElement('li');
        beat_li.appendChild(document.createTextNode(beat_catalog_beatmaker_short[bc].name));
        $(beat_li).on('click', { gid: bc, gname: beat_catalog_beatmaker_short[bc].name, album_id: beat_catalog_beatmaker_short[bc].album_id }, function (event) {
            get_audio_from_album(event.data.gid, event.data.album_id, event.data.gname, '//vk.com/club' + event.data.gid);
        });
        $(inner_div).append(beat_li);
    }

    var g_counter = 0;
    for (var g_key in beat_group_names) {
        setTimeout(function (x) {
            return function () {
                add_one_group_of_beats(x, inner_div_id);
            };
        }(g_key), g_counter);
        g_counter += 1000;
    }

    return inner_div;
}


function add_one_group_of_beats(gid, inner_div_id) {
    var bml = $('#' + inner_div_id);
    VK.api("audio.getAlbums", { gid: gid }, function (r) {
        var tpu;
        var expr = /'/g;
        var expr_double = /"/g;
        for (var album_key = 0, max_album_key = r.response.length; album_key < max_album_key; album_key++) {
            if (r.response[album_key].title) {
                tpu = bj_fill_beatmakers_list(r.response[album_key].title);
                bml.append('<li onclick="get_audio_from_album(' + gid + ', ' + r.response[album_key].album_id + ',\'' + tpu.title.replace(expr, '\\\'').replace(expr_double, '\\\'') + '\', \'' + tpu.beatmaker_url + '\')">' + tpu.title + '</li>');
            }
        }
    });
}

function bj_fill_beatmakers_list(title) { //get title and url from title
    title = $.trim(title);
    var last_right_skoba = title.lastIndexOf(']');
    var last_left_skoba = title.lastIndexOf('[');
    var beatmaker_url = '';
    if (last_right_skoba > 0 && last_left_skoba > 0 && last_right_skoba === (title.length - 1)) {
        beatmaker_url = title.substring(last_left_skoba + 1, last_right_skoba).toLowerCase();
        if (beatmaker_url !== '') {
            var url_patt = /\/\/vk.com\//g;
            var url_check_result = url_patt.test(beatmaker_url);
            if (!url_check_result) { beatmaker_url = ''; }
        }
        title = title.substring(0, last_left_skoba);
        title = $.trim(title);
    }
    return { title: title, beatmaker_url: beatmaker_url };
}

function get_audio_from_album(gid, album_id, album_title, album_url) {
    VK.api("audio.get", { gid: gid, album_id: album_id }, function (r) {
        var rlength = r.response.length;
        if (rlength < 1) {
            event_msg_show('Отсутствует коллекция битов');
            return;
        }

        var oc = $('#flow_content');
        $('#flow_header_name').html('<span>' + album_title + '</span><a style="display:inline-block; margin-left:5px" class="img_link_user" href="//vk.com/club' + gid + '" target="_blank"></a>');
        $('#flow_window').show().focus();
        $('#flow_content').append('<div id="beat_catalog_beat_list"></div>');
        var pl_list = { playlist: [] };
        var b_artist;
        for (var beat_key = 0, max_beat_key = r.response.length; beat_key < max_beat_key; beat_key++) {
            b_artist = r.response[beat_key].artist;
            if (beat_group_names[gid]) {
                for (var er_key = 0, er_key_max = beat_group_names[gid].length; er_key < er_key_max; er_key++) {
                    b_artist = b_artist.replace(beat_group_names[gid][er_key], '');
                }
            }

            bj_table_add_record(r.response[beat_key].aid, r.response[beat_key].owner_id, b_artist, r.response[beat_key].title, r.response[beat_key].url, r.response[beat_key].duration, album_url, "beat_catalog_beat_list");
            pl_list.playlist[beat_key] = { file: r.response[beat_key].url, comment: b_artist + r.response[beat_key].title };
        }

        //$('#all_play').off('click').on('click', function () {
        //    construct_player(null, JSON.stringify(pl_list)
        //}).show();

    });
}

function bj_table_add_record(beat_aid, beat_owner_id, beat_artist, beat_title, beat_url, beat_duration, author_link, in_container) {
    beat_artist = $.trim(beat_artist);
    beat_title = $.trim(beat_title);
    //var beat_price = get_price_from_title(beat_title);
    //var beat_tags = '';
    //if (beat_price != '') {
    //    beat_title = beat_title.substring(0, beat_title.lastIndexOf('['));
    //    beat_tags = get_tags_from_title(beat_title);
    //    if (beat_tags != '') {
    //        beat_title = beat_title.substring(0, beat_title.lastIndexOf('['));
    //    }
    //}

    var div_all = document.createElement("div");
    $(div_all).css({ "padding": "8px 0" });

    var div_play_wrap = document.createElement("div");
    $(div_play_wrap).addClass("pull-left").css({ "width": "40px", "padding": "0" });

    var div_right_arrow_wrap = document.createElement("div");
    $(div_right_arrow_wrap).addClass("right_arrow_wrap").on("click", function (event) {
        $(div_all).css({ "background-color": "#f1f1f1" });
        bj_play(null, { aid: beat_aid, oid: beat_owner_id }, beat_url, null, beat_artist, beat_title, author_link, null);
        //$(this).css('background-color', '#ccc');
    });

    //составление контейнера для кнопки проигрывания трека
    $(div_right_arrow_wrap).append(
         '<div class="prepause pull-left"></div>',
        '<div class="right_arrow pull-left"></div>',
        '<div class="fl_cl"></div>'
    );

    div_play_wrap.appendChild(div_right_arrow_wrap);


    //  var div_tags = '<div style="text-align:right; padding-right:10px;"><span style="color:#888">' + (beat_tags ? beat_tags : '') + '  ' + (beat_price ? beat_price : '') + '&nbsp;</span></div>';
    var div_title = '<div class="pull-left" style="width:390px; padding-top:4px"><span style="color: #2B587A; font-weight:bold">' + beat_artist + '</span> - ' + beat_title + '</div>';
    var div_time = '<div class="pull-right" style="color: #777; padding-top:4px;">' + seconds_to_hms(beat_duration) + '</div>';


    div_all.appendChild(div_play_wrap);
    $(div_all).append(div_time + div_title + '<div class="fl_cl"></div>');

    $('#' + in_container).append(div_all);
}

function get_tags_from_title(t) {
    t = $.trim(t);
    var last_right_skoba = t.lastIndexOf(']');
    var last_left_skoba = t.lastIndexOf('[');
    if (last_right_skoba > 0 && last_left_skoba > 0 && last_right_skoba === (t.length - 1)) {
        return t.substring(last_left_skoba + 1, last_right_skoba).toLowerCase();
    }
    return '';
}


function get_price_from_title(t) {
    t = $.trim(t);
    var last_right_skoba = t.lastIndexOf(']');
    var last_left_skoba = t.lastIndexOf('[');
    if (last_right_skoba > 0 && last_left_skoba >= 0 && last_right_skoba === (t.length - 1)) {
        t = t.substring(last_left_skoba + 1, last_right_skoba).toLowerCase();
    }

    return t;
    //t = t.replace('р.', '').replace('руб.', '').replace('р', '');
    //if (t == 'free' || t == '0' || t == 'бесплатно') {
    //    return 'free';
    //}
    //else if (t == parseInt(t, 10)) {
    //    return t;
    //}
    //else if ((t.substring(0, 5) == 'under') && (t.substring(5, t.length) == parseInt(t.substring(5, t.length), 10))) {
    //    return parseInt(t.substring(5, t.length), 10);
    //}
    //    else return '';
}

function play_file_jquery(audata, author_link, material_id) {
    VK.api('audio.get', audata, function (r) {
        if (!r.response || r.response.length === 0) {
            event_msg_show('Трек был удалён либо закрыты права на доступ');
            
            $.ajax('{{conf.reqUrl}}/api/log-record', {
              type: 'POST',
              contentType: 'application/json;charset=utf-8',
              data: JSON.stringify({
                LogSubject: 'AudioError',
                LogBody: 'Ошибка при доступе к аудиозаписи: ' + JSON.stringify(audata)
              })
            });
            
            return;
        }
        bj_play(material_id, { aid: r.response[0].aid, oid: r.response[0].owner_id }, r.response[0].url, null, r.response[0].artist, r.response[0].title, author_link, r.response[0].lyrics_id);
    });
}

function show_judge_info(uid, gid, album_id, nickname, u_description) {
    $('#out_header_name').html(nickname);
    $('#out_content').html('<div><div style="float:left"><h5>' + nickname + '</h5></div><div style="float:left; width:12px; position:relative">&nbsp;<a style="position:absolute; top:5px" class="img_link_user" href="//vk.com/id' + uid + '" target="_blank">&nbsp;</a></div><div style="float:left; padding:10px;">' + u_description + '</div><div style="clear:both"></div></div>');
    $('#out_window').show().focus();
    VK.api("audio.get", { uid: uid, gid: gid, album_id: album_id }, function (r) {
        for (var rkey = 0, max_rkey = r.response.length; rkey < max_rkey; rkey++) {
            bj_table_add_record(r.response[rkey].aid, r.response[rkey].owner_id, r.response[rkey].artist, r.response[rkey].title, r.response[rkey].url, r.response[rkey].duration, "//vk.com/id" + uid, "out_content");
        }
    });
}

var bb_tags = {
    "instrumental": false,
    "undeground": false,
    "club": false,
    "piano": false,
    "gangsta": false,
    "rnb": false,
    "electro": false,
    "lyric": false
};

function send_track_to_battle(battle_type, my_aid, my_oid, my_title) {
    VK.api('audio.add', { 
      audio_id: my_aid, 
      owner_id: my_oid,
      group_id: battle_types[battle_type].battle_group_id,
      v: '5.9'
    }, function (res_new_track) {
        if (res_new_track.error) {
            // 15 - "Access denied: no access to audio"
            // 201 - Group
            if (res_new_track.error.error_code === 201 || res_new_track.error.error_code === 15) {
                event_msg_show('Для участия необходимо вступить в группу: <a href="//vk.com/club' + battle_types[battle_type].battle_group_id + '" target="_blank">vk.com/club' + battle_types[battle_type].battle_group_id + '</a>. Обновите страницу после вступления в группу.');
            }
            else {
                sys_msg_show();
            }
            return;
        }

        var artist_new;
        if (battle_type === "audio_battle") {
            artist_new = (user_author.nick_name.value || 'Неизвестный исполнитель');
        }
        else if (battle_type === "beat_battle") {
            artist_new = (user_author.beatmaker_name.value || 'Неизвестный исполнитель');
        }

        VK.api('audio.edit', {
            audio_id: res_new_track.response,
            owner_id: -parseInt(battle_types[battle_type].battle_group_id, 10),
            artist: artist_new,
            title: my_title,
            text: '',
            no_search: 0,
            v: '5.9'
        }, function () {
            //adding to table with aid (res_new_track.response)
            // and my_oid for checking!
            var json_data = {
                flow_text: res_new_track.response,
                round_id: btl_event.current_round_id
            };

            send_track_item_to_battle(json_data);
        });
    });
}

function send_track_item_to_battle(json_data) {
    $.ajax('{{conf.reqUrl}}/api/round/' + json_data.round_id + '/material-flow', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      cache: false,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify({
        'FlowContent': json_data.flow_text
      })
    }).done(function () {
        var subs_div = document.createElement("div");
        popup_msg("Аудиозапись успешно сдана на баттл.", subs_div);

        VK.api("getUserSettings", function (gus) {
            if ((gus.response & 1) !== 1) {
                var subs_cmnt_in = document.createElement("span");

                subs_cmnt_in.appendChild(document.createTextNode("Разрешить приложению присылать уведомления (о новых оценках, комментариях, запуске новых раундов)"));

                $(subs_cmnt_in).on('click', function () {
                    VK.callMethod("showSettingsBox", 1);
                }).addClass("link_view");

                subs_div.appendChild(subs_cmnt_in);
            }
        });

        btlApp.viewModel.selectedBattleSeason().currentBattleRound().getAuthUserRoundMaterial();
    });
}

function show_choose_audio(aid, battle_type, owner_id, url, artist, title, duration) {
    $('#out_header_name').html('Форма сдачи');
    $('#out_window').show().focus();
    var pass_form_div = document.createElement("div");
    $('#out_content').html(pass_form_div);

    $(pass_form_div).append(
        $('<div></div').html(
            $('<span></span>').addClass("link_view").css({ "font-size": "10px" }).html("вернуться к выбору аудиозаписи").on("click", function () { choose_track(battle_type, 0); })
        )
    );

    $(pass_form_div).append('<h5>Выбранная аудизапись</h5>');

    //кнопка плэй для прослушивания выбранной аудиозаписи
    var pass_form_player = document.createElement("div");
    $(pass_form_player).addClass("right_arrow_wrap").html('<div class="right_arrow">').on("click", function () {
        bj_play(null, { aid: aid, oid: owner_id }, url, null, artist, title, null, null);
    });

    //название аудиозаписи
    var pass_form_track_title = document.createElement('input');
    $(pass_form_track_title).attr({ "type": "text" }).css({ "width": "380px" }).val(title);

    //длительность аудиозаписи
    var track_duration_div = document.createElement("div");
    $(track_duration_div).css({ "color": "#555", "padding-top": "8px" }).html(seconds_to_hms(duration));

    //добавление в одну строку кнопки плэй и строки ввода названия аудиозаписи
    $(pass_form_div).append(
        $('<div></div>').addClass("pull-left").css({ "padding": "6px" }).html(pass_form_player),
        $('<div></div>').addClass("pull-left").css({ "padding": "4px" }).html(pass_form_track_title),
        $('<div></div>').addClass("pull-left").css({ "padding": "4px" }).html(track_duration_div),
        $('<div></div>').addClass("fl_cl")
    );

    if (btl_event.current_round_id === -2147483558) {
        var is_track_valid = true;
        if (duration > 80) {
            $(pass_form_div).append('<p style="color:red">К участию в отборочном раунде баттла допускаются только треки, длительность которых не превышает 80 секунд (1:20)</p>');
            is_track_valid = false;
        }

        if (is_track_valid === false) {
            return;
        }

    }

    //тэги для бита
    if (battle_type == "beat_battle") {
        var pass_form_tags_div = document.createElement("div");
        $(pass_form_tags_div).addClass("bb_tag_list");
        for (var bb_key in bb_tags) {
            bb_tags[bb_key] = false;
            var dv = document.createElement('div');

            $(dv).on('click', { tag_txt: bb_key }, function (event) {
                if (bb_tags[event.data.tag_txt] === true) {
                    $(this).removeClass("checked_tag");
                    bb_tags[event.data.tag_txt] = false;
                }
                else {
                    $(this).addClass("checked_tag");
                    bb_tags[event.data.tag_txt] = true;
                }
            }).html('<span>' + bb_key + '</span>');
            $(pass_form_tags_div).append(dv);
        }

        $(pass_form_div).append('<h5 style="text-align:center" title="Укажите тэги к биту для удобности оценивания">Укажите тэги:</h5>', pass_form_tags_div);
    }

    //кнопка сдачи аудизаписи на баттл
    var pass_form_button = document.createElement("button");

    $(pass_form_button).prop("type", "button").addClass("btn btn-primary").html("Сдать на участие").one("click", function () {
        var trackTitle = $(pass_form_track_title).val();
        //формируется тайтл записи (для битмейкер баттла) с конкантенацией тэгов бита
        if (battle_type === "beat_battle") {
            var t_arr = [];
            var t_counter = 0;
            for (var bb_tags_key in bb_tags) {
                if (bb_tags[bb_tags_key] === true) {
                    t_arr[t_counter] = bb_tags_key;
                    t_counter++;
                }
            }
            trackTitle = trackTitle + (t_arr.length > 0 ? (" [ " + t_arr.join('; ') + " ]") : "") + " [ free ]";
        }

        trackTitle = $.trim(trackTitle);

        out_window_hide();
        send_track_to_battle(battle_type, aid, owner_id, trackTitle);
    });


    $(pass_form_div).append(
        $('<div></div>').css({ "text-align": "center", "margin-top": "8px" }).html($('<div></div>').html(pass_form_button))
    );

    $(pass_form_div).append(
        $('<div></div>').css({ "text-align": "center", "margin-top": "4px" }).html('<small>*cдавая произведение на участие Вы подтверждаете, что ознакомлены с <span class="link_view" onclick="show_out_window(\'about.html\')">правилами баттла</span></small>')
    );
}

var scht = {
    count_set: 30
};


function choose_album(battle_type) {
    $('#out_header_name').html('Выбор альбома');
    $('#out_window').show().focus();
    var out_content_block = $('#out_content');
    VK.api("audio.getAlbums", function (r) {
        if (r.response[0] > 0) {
            out_content_block.html('<h5>Выберите альбом:<h5>');
            for (var key = 1, max_key = r.response.length; key < max_key; key++) {
                out_content_block.append('<div class="radiobtn" onclick="out_window_hide(); choose_track(\'' + battle_type + '\', \'' + r.response[key].album_id + '\')"><div></div>' + r.response[key].title + '</div>');
            }
        }
        else {
            out_content_block.html('<p>Альбомы аудиозаписей отустствуют</p>');
        }
    });
}


function add_audio_to_list(r, in_div, battle_type) {
    var temp_str_for_track_name, t_div; //нулевые элементы, чтобы не пересоздавать в цикле
    for (var track_key = 0, max_track_key = r.response.length; track_key < max_track_key; track_key++) {
        t_div = document.createElement('div');
        $(t_div).addClass('radiobtn').on('click', {
            aid: r.response[track_key].aid,
            owner_id: r.response[track_key].owner_id,
            url: r.response[track_key].url,
            artist: r.response[track_key].artist,
            title: r.response[track_key].title,
            duration: r.response[track_key].duration
        }, function (event) {
            out_window_hide();
            show_choose_audio(event.data.aid, battle_type, event.data.owner_id, event.data.url, event.data.artist, event.data.title, event.data.duration);
        });
        //adding empty div element for radiobtn
        t_div.appendChild(document.createElement('div'));



        //adding text to choice radiobtn
        temp_str_for_track_name = (r.response[track_key].artist + ' - ' + r.response[track_key].title);
        //temp_str_for_track_name = (temp_str_for_track_name.length > 90) ? (temp_str_for_track_name.substring(0, 90) + '...') : temp_str_for_track_name;

        $(t_div).append(
          $('<span></span>').addClass("ellipsis_title pull-left").css({ "width": "400px" }).html(temp_str_for_track_name).attr({ "title": temp_str_for_track_name })
        );

        $(t_div).append(
            $('<span></span>').addClass("pull-right").css({ "color": "#ccc" }).html(seconds_to_hms(r.response[track_key].duration))
        );
        in_div.appendChild(t_div);
    }
}


function choose_track(battle_type, album_id) {
    VK.api('audio.get', { 
        count: scht.count_set, 
        album_id: album_id 
      }, function (audio_arr) {
        if (audio_arr.response.length === 0) {
            event_msg_show("Не найдено ни одной аудиозаписи на Вашей странице социальной сети");
            return;
        }

        $("#out_header_name").html("Выбор аудиозаписи");
        $("#out_window").show().focus();
        var out_content_block = $('#out_content');
        out_content_block.empty();

        var inner_audio = document.createElement("div");
        $(inner_audio).append(
            $('<div></div>').append(
                '<div class="pull-left"><h5>Выберите трек из Ваших аудиозаписей:</h5></div>',
                 $('<div></div>').addClass("pull-right").html('<span class="link_view">уточнить альбом</span>').on("click", function () { choose_album(battle_type); }),
                '<div class="fl_cl"></div>'
            )
        );
        out_content_block.append(inner_audio);

        add_audio_to_list(audio_arr, inner_audio, battle_type);

        // если более или равно 30 аудио, включаем скролл, если нет, не включаем
        if (audio_arr.response.length == scht.count_set) {
            var uac = audio_arr.response.length;
            out_content_block.off('scroll').on('scroll', { uac: uac }, function (event) {
                if (Math.abs($(inner_audio).offset().top) + out_content_block.height() + out_content_block.offset().top >= $(inner_audio).outerHeight() - 10) {
                    VK.api("audio.get", { count: scht.count_set, offset: event.data.uac, album_id: album_id }, function (r) {

                        add_audio_to_list(r, inner_audio, battle_type);

                        if (r.response.length === scht.count_set) {
                            event.data.uac += scht.count_set;
                        }
                        else {
                            out_content_block.off('scroll');
                        }
                    });
                }
            });
        }
    });
}


function wall_post(wall_message) {
    VK.api('wall.post', { message: wall_message });
    return false;
}



//=========================================beat battle======================================
function beat_battle_creation() {
    $('#bc_comments').hide();
    $('#bc_player_play').hide();
    
    $.ajax('{{conf.reqUrl}}/api/round/' + btl_event.current_round_id + '/current-item' , {
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
        if (r.flow_text) {
            $('#bc_player_play').off('click').on('click', { aid: r.flow_text }, function (event) {
                play_file_jquery({ gid: battle_types.beat_battle.battle_group_id, aids: event.data.aid }, null, null);
            }).show();
            get_voice_stat("beat_battle");
            add_comments_to_block(r.id, document.getElementById("bc_comments"), "beat_battle", false, "bc_rating_stars_block");
        }
        else {
            sys_msg_show();
        }
    });
}

function beat_battle_judging() {
    generate_judging_texts('beat_battle', false);
}

function beat_battle_rating() {
    $('#event_msg_block').empty().hide();
    var battle_type = 'beat_battle';
    get_round_result(0, battle_type, 0);
    $('#tournir_beat_catalog').html(fill_div_beatmaker("tournir_beat_catalog_inner_div"));
}

//============================audio_battle====================

function audio_battle_creation() {

    //var nosdan_arr = '19064903,55301990,95394158,139988367,56547718,44927375,14766353,155351430,80223497,15221267,87300878,52702088,63912607,125845914,26011234,3009385,8346967,89843673,86940514,29824718,63238982,100497648,32320123,47061401,164472683,3075217,371495,160903944,137768009,19392154,93772403,148219258,128128917,69901681,108323566,144936195,28508075'.split(',');

    //if (nosdan_arr.indexOf(get_part_url('viewer_id')) != '-1') {
    //    VK.api("getUserSettings", function (r) {
    //        if ((r.response & 1) != 1) {
    //            event_msg_show('Вы прошли отборочный раунд. Приём треков на следующий раунд: до 10 июля. Рекомендация: <span class="link_view" onclick="VK.callMethod(\'showSettingsBox\', 1)">разрешите приложению присылать Вам уведомления</span> для своевременного уведомления о запуске раундов');
    //        }
    //    });
    //};

    // event_msg_show('');
    //hide_all_ac_elements
    $('#ac_comments').hide();
    $('#ac_player_play').hide();

    $.ajax('{{conf.reqUrl}}/api/round/' + btl_event.current_round_id + '/current-item' , {
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
        if (r.flow_text) {
            $('#ac_player_play').off('click').on('click', { aid: r.flow_text }, function (event) {
                play_file_jquery({ gid: battle_types.audio_battle.battle_group_id, aids: event.data.aid }, null, null);
            }).show();
            get_voice_stat("audio_battle");
            add_comments_to_block(r.id, document.getElementById("ac_comments"), "audio_battle", false, "ac_rating_stars_block");
        }
        else {
            sys_msg_show();
        }
    });
}

function audio_battle_judging() {
    generate_judging_texts('audio_battle', false);
}

var audio_battle_number = 2;


function audio_battle_rating() {
    $('#event_msg_block').empty().hide();

    fill_audio_battle_rating();

    //var tta = 'tournir_table_audio.html #page_content';
    //$('#ext_rating_audio').hide().load(tta,
    //function () {

    //    //  event_msg_show('<div><span style="font-weight:bold">Участникам основного аудиобаттла</span>: результаты четвертьфинала - позже</div>');
    //    fill_audio_battle_rating();
    //    $('#ext_rating_audio').show();

    //});
}

function fill_audio_battle_rating() {
    var battle_type = 'audio_battle';
    get_round_result(0, battle_type, 0);
    get_round_result(16, battle_type, audio_battle_number);
    get_round_result(8, battle_type, audio_battle_number);
    get_round_result(4, battle_type, audio_battle_number);
    get_round_result(2, battle_type, audio_battle_number);
    get_round_result(1, battle_type, audio_battle_number);
    //  get_audio_battle_final_run();
}

function set_is_page_show(is_page_show) {
    if (is_page_show !== null) {
      $.ajax('{{conf.reqUrl}}/api/user-info', {
        type: 'POST',
        xhrFields: {
          withCredentials: true
        },
        contentType: 'application/json;charset=utf-8',
        data: JSON.stringify({
          IsPageShow: is_page_show
        })
      }).done(function () {
         $('#save_nick_msg').css('color', 'green').html('Ссылка на Вашу страницу ' + (is_page_show ? '' : 'не') + ' отображается в турнирной таблице').show().delay(2000).fadeOut('fast');
      });
    }
}

function showPaymentBox() {
    //  popup_msg("Ошибка", "Пополнение монет через голоса временно не работает");
    VK.callMethod('showOrderBox', { type: "votes", votes: "1" });
}

function text_work(in_text) {
    in_text = in_text.replace(/<.*?>/g, '');
    in_text = $.trim(in_text);
    in_text = in_text.replace(/\r\n|\r|\n/g, '<br />');
    var regCrLf = /(<br \/>){2,}/g;
    in_text = in_text.replace(regCrLf, '<br />');
    return in_text;
}


function save_text_current_battle() {
    var flow_text = document.getElementById('flow_text').value;
    flow_text = text_work(flow_text);

    if (flow_text === '') {
        event_msg_show('Необходимо указать текст для сохранения');
        document.getElementById('flow_text').value = '';
        $('#flow_text').focus();
        return;
    }

    var max_string = 20;
    if (flow_text.split('<br />').length > max_string) {
        event_msg_show('Максимальное количество строк: ' + max_string);
        document.getElementById('flow_text').value = flow_text.replace(/<br\s?\/?>/gi, "\n");
        $('#flow_text').focus();
        return;
    }

    var max_length = 1500;
    if (flow_text.length > max_length) {
        event_msg_show('Максимальное количество символов: ' + max_length);
        document.getElementById('flow_text').value = flow_text.replace(/<br\s?\/?>/gi, "\n");
        $('#flow_text').focus();
        return;
    }

    $.ajax('{{conf.reqUrl}}/api/round/' + btl_event.current_round_id + '/temp-flow', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      xhrFields: {
        withCredentials: true
      },
      cache: false,
      data: JSON.stringify({
        'FlowContent': encodeURIComponent(flow_text)
      })
    })
    .done(function () {
        $('#flow_text').attr('readonly', 'readonly');
        text_battle_creation();
    });
};


function text_battle_creation() {
    $('#save_cancel').hide();
    $('#leave_symbol').empty();
    
    $.ajax('{{conf.reqUrl}}/api/round/' + btl_event.current_round_id + '/current-item' , {
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
        if (r.flow_text) {
            // если есть текст, отображается 
            $('textarea#flow_text').off().attr('readonly', 'readonly').css('border', '1px solid #ccf').val(r.flow_text);

            if (r.d_send_text) {
                // todo: для остальных типов баттлов тоже сделать публикацию на стену
                //add_comments_to_block(r.id, document.getElementById("comments"), "text_battle", false, "rating_stars_block");
            }
            else {
                // возможность редактировать и сдать на баттл
                $('#send_text_div').show();
                $('#flow_text_edit_link').show();
            }
        } else {
            // отобразить пустое поле и кнопку - Save
            text_edit_show();
        }
    });
}

function text_edit_show() {
    $('#flow_text_edit_link').hide();
    $('#send_text_div').hide();
    $('textarea#flow_text').removeAttr('readonly').css('border', '1px solid #aaa').off().on('keyup', function () {
        flow_symbol();
    }).focus();
    $('#save_cancel').show();
}


function get_voice_stat(battle_type) {
    ajaxRequest("get_voice_stat", { round_id: btl_event.current_round_id }, {}).done(function (r) {
        if (r) {
            var sub_text;
            if (parseInt(r.voice_pro_count) + parseInt(r.voice_con_count) <= -100) {
                sub_text = '<span title="Исключен из участия в текущем раунде в связи с нарушением правил либо большим количеством отрицательных оценок">снят с участия</span>';
            }
            else {
                sub_text = '<span style="font-weight:bold" title="голосов за/голосов против">+' + r.voice_pro_count + '/' + r.voice_con_count + '</span>';
            }
            $('#' + battle_type + '_voice_block').html(sub_text).show();
        }
    });
}

function timer(bt) {
    var obj = document.getElementById(bt + '_timer_block');
    obj.innerHTML--;

    if ($('#' + bt + '_judging_block').is(':visible')) {
        if (obj.innerHTML === '0') {
            $(obj).hide();
            $('#' + bt + '_send_golos').removeAttr('disabled');
            setTimeout(function () { }, 1000);
        }
        else {
            setTimeout(function () { timer(bt); }, 1000);
        }
    }
    else {
        setTimeout(function () { }, 1000);
    }
}

function check_same_symbols(str) {
    str = str.replace(/\s/g, '').toLowerCase();
    for (var i = 0, max_i = str.length; i < max_i; i++) {
        if (str[i] !== str[0]) {
            if (str[i] !== str[1]) { //заведомо проверено на достаточное кол-во символов
                return false; //если символ не совпадает с первым, тогда строка корректная (а также, если символ не совпадает со вторым по типу "лалала" или "оллло")
            }
        }
    }
    return true; //если все символы одинаковые в строке, тогда строка некорректная
}

function judge_send_two_comments(battle_type, json_cm) {
    // отправляем запрос с оценкой на сервер
    // отправляем коммент на сервер
    var ocenka_msg = $('#' + battle_type + '_ocenka_msg');
    ocenka_msg.empty();

    // проверка на требуемые данные для 1 текста
    if (!json_cm.flow_rating_theme_1 || !json_cm.flow_rating_general_1) {
        ocenka_msg.html('*к первой записи не указаны оценки: ' + (json_cm.flow_rating_theme_1 ? '' : battle_types[battle_type].ocn.theme.oname) + ' ' + (json_cm.flow_rating_general_1 ? '' : battle_types[battle_type].ocn.general.oname));
        return;
    }
    // проверка на требуемые данные для 2 текста
    if (!json_cm.flow_rating_theme_2 || !json_cm.flow_rating_general_2) {
        ocenka_msg.html('*ко второй записи не указаны оценки: ' + (json_cm.flow_rating_theme_2 ? '' : battle_types[battle_type].ocn.theme.oname) + ' ' + (json_cm.flow_rating_general_2 ? '' : battle_types[battle_type].ocn.general.oname));
        return;
    }

    // проверка длины 1 комментария
    if (json_cm.flow_comment1.length <= 5) {
        ocenka_msg.html('*к первой записи не указан комментарий (более 5 символов)');
        return;
    }

    // проверка длины 2 комментария
    if (json_cm.flow_comment2.length <= 5) {
        ocenka_msg.html('*ко второй записи не указан комментарий (более 5 символов)');
        return;
    }

    // проверка длины 1 комментария
    if (json_cm.flow_comment1.length > 800) {
        ocenka_msg.html('*к первой записи длина комментария превысила максимальный размер: 800 символов');
        return;
    }

    // проверка длины 2 комментария
    if (json_cm.flow_comment2.length > 800) {
        ocenka_msg.html('*ко второй записи длина комментария превысила максимальный размер: 800 символов');
        return;
    }

    // корректность 1 комментария
    if (check_same_symbols(json_cm.flow_comment1)) {
        ocenka_msg.html('*к первой записи указан некорректный комментарий');
        return;
    }

    // корректность 2 комментария
    if (check_same_symbols(json_cm.flow_comment2)) {
        ocenka_msg.html('*ко второй записи указан некорректный комментарий');
        return;
    }

    var full_ocenka_1 = parseInt(json_cm.flow_rating_rhyme_1) + parseInt(json_cm.flow_rating_theme_1) + parseInt(json_cm.flow_rating_general_1);
    var full_ocenka_2 = parseInt(json_cm.flow_rating_rhyme_2) + parseInt(json_cm.flow_rating_theme_2) + parseInt(json_cm.flow_rating_general_2);

    if (full_ocenka_1 === full_ocenka_2) {
        ocenka_msg.html('*сумма оценок совпадает - ничейный исход запрещён.');
        return;
    }
    else if (full_ocenka_1 > full_ocenka_2) {
        json_cm.voice_win = '1';
    }
    else if (full_ocenka_2 > full_ocenka_1) {
        json_cm.voice_win = '-1';
    }
    else {
        event_msg_show('Непредвиденная ошибка при оценивании. Попробуйте позже или обратитесь к администрации баттла.');
        return;
    }

    json_cm.flow_comment1 = encodeURIComponent(json_cm.flow_comment1);
    json_cm.flow_comment2 = encodeURIComponent(json_cm.flow_comment2);

    $('#' + battle_type + '_send_golos').attr('disabled', 'disabled');
    
    $.ajax('{{conf.reqUrl}}/api/judge-evaluation', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      xhrFields: {
        withCredentials: true
      },
      cache: false,
      data: JSON.stringify({
        'JudgeEvaluation1': {
          'IdOfMaterial': json_cm.flow_id1,
          'Comment': json_cm.flow_comment1,
          'RatingRhyme': json_cm.flow_rating_rhyme_1,
          'RatingTheme': json_cm.flow_rating_theme_1,
          'RatingGeneral': json_cm.flow_rating_general_1,
          'IsCommentSign': json_cm.comment_sign_1
        },
        'JudgeEvaluation2': {
          'IdOfMaterial': json_cm.flow_id2,
          'Comment': json_cm.flow_comment2,
          'RatingRhyme': json_cm.flow_rating_rhyme_2,
          'RatingTheme': json_cm.flow_rating_theme_2,
          'RatingGeneral': json_cm.flow_rating_general_2,
          'IsCommentSign': json_cm.comment_sign_2
        },
        'IsFirstWinner': parseInt(json_cm.voice_win) > 0
      })
    }).done(function (r) {
        $('#' + battle_type + '_judging_block').hide();
        update_balance_string();

        var jr_rating = Number(r).toPrecision(3);
        event_msg_show(
            $('<div></div>').css({ "margin-bottom": "4px", "margin-top": "16px", "text-align": "center" }).append(
                $('<span></span>').html('Получено <span style="font-weight: bold">' + (Math.round(r) * 2) + plural_number(r, ' монет', '', 'ы', '') + '</span>')
            ),
            $('<div></div>').css({ "padding-top": "5px", "text-align": "center" }).html(
                $('<button/>').prop("type", "button").addClass("btn btn-primary").html("Оценить ещё").on("click", function () { battle_types[battle_type].menu_attr[1].menu_function(); })
            ),
            $('<div></div>').css({ "margin-top": "8px", "text-align": "center", }).html('Судейский рейтинг: <span style="font-weight:bold">' + jr_rating + '</span>'),
            $('<div></div>').css({ "margin-top": "4px" }).html('Судейский рейтинг - среднее арифметическое от всех оценок ваших комментариев. Количество полученных монет за каждый оставленный комментарий соответствует округлённому значению вашего рейтинга.'),
            $('<div></div>').css({ "margin-top": "8px" }).html("За каждую выставленную оценку (комментарий) вы можете дополнительно получить до 10 монет в зависимости от решения получателя комментария (исполнителя произведения). Чтобы посмотреть вознаграждения, кликните на ваш баланс (в правом верхнем углу)")
        );
        //                '<button onclick="' + battle_type + '_judging()">Оценить ещё</button>'
        // '<p style="margin-top:4px">За каждую благодарность к Вашему комментарию дополнительно начисляется 5 монет (по окончании раунда)</p>',
        //'<p>Жалобы на Ваши комментарии и оценки могут привести к блокировке судейства на неопределённый срок.</p>'
        
        function sendEvaluationNotification(tmpIdOfMaterial){
          $.ajax('{{conf.reqUrl}}/api/material/' + tmpIdOfMaterial + '/evaluation-notification', {
            type: 'GET',
            cache: false,
            xhrFields: {
              withCredentials: true
            }
          });
        }
        
        sendEvaluationNotification(json_cm.flow_id1);
        
        setTimeout(function () {
            sendEvaluationNotification(json_cm.flow_id2);
        }, 5000);
    });
};

function vk_window_change(block_name) {
    $("#vk_group_news").hide();
    $("#vk_battle_chat").hide();
    $("#beat_main_catalog").hide();
    $("#" + block_name).show();
}

var MaterialDto = function (item) {
    var self = this;
    self.id = item.id;
    self.mtype = item.mtype;
    self.create_date = item.create_date;
    self.last_change_date = item.last_change_date;
    self.mname = item.mname;
    self.mcontent = item.mcontent;
    self.mdesc = item.mdesc;
};

function generate_judging_texts(bt, is_alternative) {
    $('#event_msg_block').empty().hide();
    document.getElementById(bt + '_judging_comment_1').value = '';
    document.getElementById(bt + '_judging_comment_2').value = '';
    //обнуление всех элементов
    $('#' + bt + '_comment_sign_1').removeAttr('checked');
    $('#' + bt + '_comment_sign_2').removeAttr('checked');
    $('#' + bt + '_judging_block').hide();
    $('#' + bt + '_send_golos').attr('disabled', 'disabled');
    $('#' + bt + '_itog_rating_1').html(0).css('background-color', '#5E80A5');
    $('#' + bt + '_itog_rating_2').html(0).css('background-color', '#5E80A5');
    $('#' + bt + '_ocenka_msg').empty();

    $.ajax('{{conf.reqUrl}}/api/material?round_id=' + btl_event.current_round_id + '&is_alternative=' + is_alternative, {
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
            if (r.length < 2) {
                event_msg_show('Недостаточно произведений для оценивания');
                return;
            }

            var mt1 = new MaterialDto(r[0]);
            var mt2 = new MaterialDto(r[1]);

            var json_array_div1 = {};
            var json_array_div2 = {};

            $('#' + bt + '_rating_stars_1').html(get_star_rating_string(bt, 1, json_array_div1));
            $('#' + bt + '_rating_stars_2').html(get_star_rating_string(bt, 2, json_array_div2));

            $('#' + bt + '_claim_1').off('click').on('click', { flow_id: mt1.id }, function (event) {
                send_claim(event.data.flow_id);
            });
            $('#' + bt + '_claim_2').off('click').on('click', { flow_id: mt2.id }, function (event) {
                send_claim(event.data.flow_id);
            });

            if (bt === 'audio_battle' || bt == 'beat_battle') {
                $('#' + bt + '_judging_player_1_run').off('click').on('click', { aid: mt1.mcontent, player_number: 1, battle_type: bt }, function (event) {
                    play_audio_judging(event.data.aid, event.data.player_number, event.data.battle_type);
                }).show();
                $('#' + bt + '_judging_player_2_run').off('click').on('click', { aid: mt2.mcontent, player_number: 2, battle_type: bt }, function (event) {
                    play_audio_judging(event.data.aid, event.data.player_number, event.data.battle_type);
                }).show();
            }
            else if (bt === "text_battle") {
                $('#flow_text_ready_1').html(mt1.mcontent);
                $('#text_battle_j_header_1').html(mt1.mname);

                $('#flow_text_ready_2').html(mt2.mcontent);
                $('#text_battle_j_header_2').html(mt2.mname);
            };


            $('#' + bt + '_timer_block').html('59').show();
            setTimeout(function () { }, 1000);
            setTimeout(function () {
                timer(bt);
            }, 1000);


            $('#' + bt + '_send_golos').off('click').on('click', function () {
                judge_send_two_comments(bt, {
                    flow_id1: mt1.id,
                    flow_id2: mt2.id,
                    flow_comment1: text_work(document.getElementById(bt + '_judging_comment_1').value),
                    flow_comment2: text_work(document.getElementById(bt + '_judging_comment_2').value),
                    flow_rating_rhyme_1: $(json_array_div1.rhyme).rateit("value"),
                    flow_rating_rhyme_2: $(json_array_div2.rhyme).rateit("value"),
                    flow_rating_theme_1: $(json_array_div1.theme).rateit("value"),
                    flow_rating_theme_2: $(json_array_div2.theme).rateit("value"),
                    flow_rating_general_1: $(json_array_div1.general).rateit("value"),
                    flow_rating_general_2: $(json_array_div2.general).rateit("value"),
                    comment_sign_1: $('#' + bt + '_comment_sign_1').is(':checked'),
                    comment_sign_2: $('#' + bt + '_comment_sign_2').is(':checked'),
                    voice_win: null
                });
            });
            $('#' + bt + '_judging_block').show();
            //judging_procent(bt);
        });
}

var claim_punkt = ["Нарушение авторских прав (плагиат)", "Угроза, клевета, оскорбление", "Неадекватное содержание произведения", "Другое"];

function send_claim(flow_id) {
    $('#out_window').show().focus();
    $('#out_header_name').html('Заявка о нарушение правил');
    $('#out_content').html('<h5>Укажите пункт нарушения правил</h5>');
    for (var key = 0, max_key = claim_punkt.length; key < max_key; key++) {
        var claim_type_div = document.createElement('div');
        $(claim_type_div).addClass("radiobtn").on("click", { claim: claim_punkt[key], flow_id: flow_id }, function (event) {
            $.ajax('{{conf.reqUrl}}/api/log-record', {
              type: 'POST',
              contentType: 'application/json;charset=utf-8',
              data: JSON.stringify({
                LogSubject: 'MaterialClaim',
                LogBody: 'Claim: ' + event.data.claim + '; Material: ' + event.data.flow_id
              })
            });
           
            out_window_hide();
        });
        claim_type_div.appendChild(document.createElement('div'));
        claim_type_div.appendChild(document.createTextNode(claim_punkt[key]));
        $('#out_content').append(claim_type_div);
    }
    $('#out_content').append('<p>При выборе варианта "Другое" по возможности свяжитесь с администрацией баттла и укажите причину</p><p>Заявка о нарушении правил рассматривается некоторое время, поэтому можно продолжать оценивать далее произведения, соответственно занижая оценки произведениям, нарушающим правила. После рассмотрения заявки о нарушении, администрация баттла по своему усмотрению решает вопрос о снятии произведения с дальнейшего участия в баттле</p>');
}

function text_battle_judging(is_alternative_in) {
    var is_alternative = (is_alternative_in) ? true : false;
    generate_judging_texts('text_battle', is_alternative);
}


function send_text_to_battle() {
    // $('#send_text_to_battle_button').attr('disabled', 'disabled');
    var count_value = $('textarea#flow_text').val().length;
    var enter_value = $('textarea#flow_text').val().split('\n').length;
    var min_length = 300;
    var min_string = 12;

    if (count_value < min_length || enter_value < min_string) {
        event_msg_show('Минимальное количество строк для участия в баттле: ' + min_string + ' (' + min_length + ' символов)');
        $('textarea#flow_text').focus();
        $('#send_text_to_battle_button').removeAttr('disabled', 'disabled');
        return;
    }

    var json_data = {
        round_id: btl_event.current_round_id,
        flow_text: ''
    };

    $.ajax('{{conf.reqUrl}}/api/round/' + json_data.round_id + '/material-flow', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      cache: false,
      xhrFields: {
        withCredentials: true
      },
      data: JSON.stringify({
        'FlowContent': json_data.flow_text
      })
    }).done(function () {
        text_battle_creation();
        var subs_div = document.createElement("div");
        popup_msg("Текст успешно сдан на баттл. Оценки и комментарии будут публиковаться под текстом по ходу оценивания.", subs_div);

        btlApp.viewModel.selectedBattleSeason().currentBattleRound().getAuthUserRoundMaterial();

        VK.api("getUserSettings", function (gus) {
            if ((gus.response & 1) !== 1) {
                var subs_cmnt_in = document.createElement("span");
                subs_cmnt_in.appendChild(document.createTextNode("Разрешить приложению присылать уведомления (о новых оценках, комментариях, запуске новых раундов)"));
                $(subs_cmnt_in).on('click', function () {
                    VK.callMethod("showSettingsBox", 1);
                }).addClass("link_view");
                subs_div.appendChild(subs_cmnt_in);
            }
        });

    }).always(function () {
        $('#send_text_to_battle_button').removeAttr('disabled', 'disabled');
    });
}

function get_rival_flow(comment_id, battle_type) {
    $.ajax('{{conf.reqUrl}}/api/bout-unit/' + comment_id + '/material-content/rival', {
      type: 'GET',
      xhrFields: {
          withCredentials: true
      },
      cache: true
    }).done(function (r) {
        var oc = $("#flow_content");
        oc.empty();
        if (battle_type === "text_battle") {
            oc.html('<p>' + r + '</p>');
        }
        else {
            var outer_player_div = document.createElement('div');
            $(outer_player_div).css({ 'border': '1px solid #E7EAED', 'padding': '4px' });
            var player_div = document.createElement('div');
            $(player_div).addClass('right_arrow_wrap').attr('title', 'Прослушать аудиозапись');
            var inner_player_div = document.createElement('div');
            $(inner_player_div).addClass('right_arrow');
            player_div.appendChild(inner_player_div);
            outer_player_div.appendChild(player_div);
            $(player_div).on('click', function () {
                play_file_jquery({ gid: battle_types[battle_type].battle_group_id, aids: r }, null, null);
            });
            oc.html(outer_player_div);
        }
        $('#flow_header_name').html("Соперник");
        $('#flow_window').show().focus();
    }).fail(function(){
      event_msg_show('Соперник снят с участия за нарушение правил баттла');
    });
}

function open_bout_unit(bout_unit_id, rtrn_values) {
    $.ajax('{{conf.reqUrl}}/api/boutunit/' + bout_unit_id, {
      type: 'POST',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
        if (r === false) {
            $("#out_header_name").html("Недостаточно монет");
            var inner_div = document.createElement("div");
            $("#out_content").html(inner_div);
            $(inner_div).append("<h5>Недостаточно монет для открытия комментария</h5>");
            $(inner_div).append($('<div></div>').css({ "margin": "4px", "text-align": "center", "padding": "4px", "border": "1px solid #E7EAED", "border-radius": "2px" }).html('<span style="font-weight:bold">Монета</span> - универсальное средство обмена в приложении баттла'));
            $(inner_div).append('<h5>Способы получения монет:</h5>');
            $(inner_div).append(
                $('<ul></ul>').addClass("listing")
                    .append('<li>оценивание произведений текстового баттла (*доступно опытным участникам)</li>')
                    .append('<li>оценивание произведений аудиобаттла (*доступно любому участнику)</li>')
                    .append('<li>оценивание произведений битмейкер-баттла (*доступно любому участнику)</li>')
                    .append(
                        $('<li></li>').html(
                            $('<span></span>').addClass("link_view").html("приобрести 100 монет за 1 голос").on("click", function () {
                                out_window_hide();
                                showPaymentBox();
                            })
                        )
                    )
            );
            $(inner_div).append(
                $('<p></p>').append(
                    '*по завершению раунда нераскрытые комментарии и оценки можно будет открыть за ту же стоимость в каталоге Ваших документов на главной странице баттла'
                )
            );

            $("#out_window").show().focus();
        }
        else {
            update_balance_string();
            rtrn_values.rtrn_function();
        }
    });
}

function showNotEnoughMoneyNotification() {
    $("#out_header_name").html("Недостаточно монет");
    var inner_div = document.createElement("div");
    $("#out_content").html(inner_div);
    $(inner_div).append("<h5>Недостаточно монет для открытия комментария</h5>");
    $(inner_div).append($('<div></div>').css({ "margin": "4px", "text-align": "center", "padding": "4px", "border": "1px solid #E7EAED", "border-radius": "2px" }).html('<span style="font-weight:bold">Монета</span> - универсальное средство обмена в приложении баттла'));
    $(inner_div).append('<h5>Способы получения монет:</h5>');
    $(inner_div).append(
        $('<ul></ul>').addClass("listing")
            .append('<li>оценить произведения любого из проводимых баттлов</li>')
            .append(
                $('<li></li>').html(
                    $('<span></span>').addClass("link_view").html("приобрести 100 монет за 1 голос").on("click", function () {
                        out_window_hide();
                        showPaymentBox();
                    })
                )
            )
    );
    $(inner_div).append(
        $('<p></p>').append(
            '*по завершению раунда нераскрытые комментарии и оценки можно будет открыть за ту же стоимость в каталоге Ваших документов на главной странице баттла'
        )
    );

    $("#out_window").show().focus();
}

var complain_thanks = {
    cmpls: {
        '-11': { ct_text: 'Заниженная оценка' },
        '-12': { ct_text: 'Неадекватная оценка' },
        '-21': { ct_text: 'Оскорбление, цензура', only_if_text_exists: true },
        '-23': { ct_text: 'Бессодержательный комментарий', only_if_text_exists: true }
    },
    thnks: {
        '11': { ct_text: 'Справедливая оценка' },
        '12': { ct_text: 'Завышенная оценка' },
        '21': { ct_text: 'Полезный комментарий', only_if_text_exists: true },
        '23': { ct_text: 'Мотивирующий комментарий', only_if_text_exists: true }
    }
};

function flow_symbol() {
    var count_value = $('textarea#flow_text').val().length;
    var enter_value = $('textarea#flow_text').val().split('\n').length;
    if (enter_value > 1) {
        var max_count = 1500;
        var max_string = 20;
        if (count_value <= max_count) {
            $('#leave_symbol').css("color", "#000").html('Cтрока: ' + enter_value + ' из ' + max_string + '. Осталось символов: ' + (max_count - count_value));
        }
        else {
            $('#leave_symbol').css("color", "#ff0000").html('Строка: ' + enter_value + '. Превышено символов: ' + (-(max_count - count_value)));
        }
        if (enter_value > max_string) {
            $('#leave_symbol').css("color", "#ff0000");
            $('#leave_symbol').html('Превышено строк: ' + enter_value);
        }
    }
    else {
        $('#leave_symbol').empty();
    }
}

function show_out_window(block_name) {
    $('#out_content').load(block_name + ' #page_content', function () {
        $('#out_window').show().focus();
    });
}

function out_window_hide() {
    var out_w = $('#out_window');
    if (out_w.is(':visible')) {
        $('#out_content').empty();
        $('#out_header_name').empty();
        out_w.hide();
    }
}

function flow_window_hide() {
    var flow_w = $('#flow_window');
    if (flow_w.is(':visible')) {
        $('#flow_content').empty();
        $('#flow_header_name').empty();
        flow_w.hide();
    }
}

function text_battle_rating() {
    $('#event_msg_block').empty().hide();
    //event_msg_show('Раздел временно недоступен');
    //$.ajax({
    //    url: "text_battle_tt.html",
    //    context: document.body
    //})


    if (user_author.nick_name.value) {
        $('#text_battle_rating_string').html('<span id="rm_64">1/64</span> > <span id="rm_32">1/32</span> > <span id="rm_16">1/16</span> > <span id="rm_8">1/8</span> > <span id="rm_4">1/4</span> > <span id="rm_2">1/2</span> > <span>финал</span>')
        .attr('title', 'этапы турнира, в которых Вы можете участвовать на данный момент (подсвечены)');
    }
    rating_fill_table_all();

    //$('#ext_rating').hide().load('tournir_table_text.html #page_content',
    //function () {
    //    $('#ext_rating').show();
    //});
}

function rating_fill_table_all() {
    user_statuses.text_battle_status_max = 128;
    user_statuses.text_battle_uch_status = null;
    var battle_type = 'text_battle';
    get_round_result(64, battle_type, 1);
    get_round_result(32, battle_type, 1);
    get_round_result(16, battle_type, 1);
    get_round_result(8, battle_type, 1);
    get_round_result(4, battle_type, 1);
    get_round_result(2, battle_type, 1);
    get_round_result(1, battle_type, 1);
}

function fill_rating_table(rd, battle_type, out_block) {
    if (rd) {
        var tab = document.createElement('table');

        tab.setAttribute('class', 'table_rating_class');
        tab.setAttribute('className', 'table_rating_class');

        $(out_block).html(tab);

        var tho = document.createElement('thead');
        var temp_tr_head = document.createElement('tr');

        var rating_th_arr = ['№', 'Исполнитель', '+', '-', 'Итог', 'Дата сдачи'];
        for (var header_key = 0, max_header_key = rating_th_arr.length; header_key < max_header_key; header_key++) {
            var temp_th = document.createElement('th');
            var temp_th_text = document.createTextNode(rating_th_arr[header_key]);
            temp_th.appendChild(temp_th_text);
            temp_tr_head.appendChild(temp_th);
        }

        tho.appendChild(temp_tr_head);
        tab.appendChild(tho);

        var tbo = document.createElement('tbody');
        tab.appendChild(tbo);

        for (var key = 0, max_key = rd.length; key < max_key; key++) {
            var name_link_div = document.createElement('div');
            if (rd[key].user_link) {
                var user_link_a = document.createElement('a');
                user_link_a.setAttribute('class', 'img_link_user');
                user_link_a.setAttribute('className', 'img_link_user');
                user_link_a.style.cssFloat = 'right';
                user_link_a.style.styleFloat = 'right';
                user_link_a.href = rd[key].user_link;
                user_link_a.target = '_blank';
                name_link_div.appendChild(user_link_a);
            }
            var showing_name = (battle_type == "beat_battle") ? rd[key].beatmaker_name : rd[key].nick_name;
            var name_link_a = document.createElement('span');

            $(name_link_a).on('click', { flow_id: rd[key].flow_id, user_link: rd[key].user_link, user_name: showing_name, battle_type: battle_type }, function (event) {
                get_flow(event.data.flow_id, event.data.user_link, event.data.user_name, "", event.data.battle_type);
            }).addClass('link_view');

            name_link_a.appendChild(document.createTextNode(showing_name || '???'));
            name_link_div.appendChild(name_link_a);


            var td_arr = [
                document.createTextNode(1 + parseInt(key, 10)),
                name_link_div,
                document.createTextNode(rd[key].voice_pro_count),
                document.createTextNode(rd[key].voice_con_count),
                document.createTextNode(rd[key].voice_pro_count + rd[key].voice_con_count),
                document.createTextNode(get_date_from_json(rd[key].d_send_text))
            ];

            //добавление всех созданных полей в таблицу
            var temp_tr = document.createElement('tr');
            for (var td_key = 0, max_td_key = td_arr.length; td_key < max_td_key; td_key++) {
                var json_td = document.createElement('td');
                json_td.appendChild(td_arr[td_key]);
                temp_tr.appendChild(json_td);
            }
            tbo.appendChild(temp_tr);
        }
    }
}


function get_rating(round_id, battle_type, out_block) {
    $.ajax('{{conf.reqUrl}}/api/round/'+round_id + '/rating', {
      type: 'GET',
      cache: false
    }).done(function (r) {
        if (r) {
            //$('#out_header_name').html('Турнирная таблица');
            //var inner_div = document.createElement("div");
            //$('#out_content').html(inner_div);
            //$('#out_window').show().focus();

            fill_rating_table(r, battle_type, out_block);
        }
        else {
            sys_msg_show();
        }
    });
}

function get_flow(material_id, user_link, user_name, material_title, battle_type, out_div) {
    var indiv = document.createElement("div");
    var is_reply_show = true;
    if (out_div) {
        $('#' + out_div).html(indiv);
        is_reply_show = false;
    }
    else {
        $('#flow_header_name').html(user_name);
        $("#flow_content").html(indiv);
        $('#flow_window').show().focus();
    }

    if (battle_type === "text_battle") {
        var flow_div = document.createElement("div");
        $(indiv).html(flow_div);
        $.ajax('{{conf.reqUrl}}/api/material/' + material_id + '/content', {
          xhrFields: {
            withCredentials: true
          },
          cache: true
        }).done(function (mcontent) {
            $(flow_div).addClass("flow_text_ready_class").html(mcontent);
        });
    }
    else {
        var outer_player_div = document.createElement('div');
        $(outer_player_div).addClass("pull-left");
        var player_div = document.createElement('div');
        $(player_div).addClass('right_arrow_wrap').attr('title', 'Прослушать аудиозапись');
        var inner_player_div = document.createElement('div');
        $(inner_player_div).addClass('right_arrow');
        player_div.appendChild(inner_player_div);
        outer_player_div.appendChild(player_div);
        $(player_div).on('click', function () {
            $.ajax('{{conf.reqUrl}}/api/material/' + material_id + '/content', {
              xhrFields: {
                withCredentials: true
              },
              cache: true
            }).done(function (mcontent) {
                     var mcontent_array = mcontent.split('_');
                     if (mcontent_array.length !== 2) { sys_msg_show(); return; }
                     var mcontent_json = {
                         aids: mcontent_array[1]
                     };
                     if (parseInt(mcontent_array[0]) < 0) {
                         mcontent_json.gid = -parseInt(mcontent_array[0], 10);
                     }
                     else {
                         mcontent_json.uid = mcontent_array[0];
                     }

                     play_file_jquery(mcontent_json, user_link, material_id);
                 });
        });
        $(indiv).html(outer_player_div);
        $(indiv).append('<div class="pull-left ellipsis_title" style="width:420px; padding:4px 0 0 8px">' + user_name + (material_title ? (' - ' + material_title) : '') + '</div>');
        $(indiv).append('<div class="fl_cl"></div>');
    }



    //div
    var reply_div = document.createElement("div");
    $(indiv).append(reply_div);

    var all_comments_div = document.createElement("div");
    indiv.appendChild(all_comments_div);


    if (is_reply_show) {


        $(reply_div).css({ "background-color": "#F1F1F1", "padding": "6px", "margin-top": "4px", "text-align": "right" });

        //textarea
        var reply_textarea = document.createElement("textarea");
        $(reply_textarea).css({ "width": "100%", "resize": "vertical" }).attr("placeholder", "Комментировать...");
        reply_div.appendChild(reply_textarea);

        //checkbox
        var reply_sign = document.createElement("input");
        $(reply_sign).attr({ "type": "checkbox" });


        //button
        var reply_button = document.createElement("button");
        reply_button.appendChild(document.createTextNode("Комментировать"));
        $(reply_button).prop("type", "button").addClass("btn btn-primary").on("click", function () {
            var reply_comment_text = $(reply_textarea).val();
            reply_comment_text = $.trim(reply_comment_text);
            if (reply_comment_text.length === 0) {
                $(reply_textarea).focus();
                return;
            }
            if (reply_comment_text.length > 800) {
                $(reply_textarea).focus();
                event_msg_show("Максимальная длина комментария - 800 символов");
                return;
            }

            add_comment_to_material(reply_comment_text, material_id, $(reply_sign).is(':checked'), all_comments_div, reply_textarea, battle_type);
        });
        //buttonwrap
        var reply_button_wrap = document.createElement("div");

        reply_button_wrap.appendChild(reply_button);
        // reply_div.appendChild(reply_button_wrap);

        var post_comment_div = document.createElement("div");
        $(post_comment_div).addClass("pull-left").css({ "margin": "10px 0 0 10px" })
            .html($('<label></label>').append(reply_sign).append('<span style="margin-left:2px;position:relative; top:-2px">подписаться</span>'));

        $(reply_div).append($('<div class="pull-left" style="margin-top:4px"></div>').append(reply_button_wrap));

        $(reply_div).append(post_comment_div);

        $(reply_div).append('<div class="fl_cl"></div');

    }

    add_comments_to_block(material_id, all_comments_div, battle_type, (out_div === "material_container") ? false : true, null);

    if (out_div === "material_container") {
        $('#material_container').show();
    }
}

function add_comments_to_block(material_id, need_div, battle_type, is_shared, star_block_name) {
    ajaxRequest('/api/boutunit?material_id=' + material_id + '&is_show_free_comments=' + is_shared, {}, { requestType: 'GET' }).done(function (r) {
        $(need_div).hide().empty();

        if (r.length === 0) { return; }

        var json_rtg = {
            rhyme: { total: 0, count: 0 },
            theme: { total: 0, count: 0 },
            general: { total: 0, count: 0 }
        };

        for (var key = 0, max_key = r.length; key < max_key; key++) {
            if (r[key].RatingGeneral) { json_rtg.general.total += r[key].RatingGeneral; json_rtg.general.count++; }
            if (r[key].RatingRhyme) { json_rtg.rhyme.total += r[key].RatingRhyme; json_rtg.rhyme.count++; }
            if (r[key].RatingTheme) { json_rtg.theme.total += r[key].RatingTheme; json_rtg.theme.count++; }

            var rdac = r[key].CmaNickName ? (r[key].CmaNickName + ':') : ' ';

            var cdiv = document.createElement("div");
            $(need_div).append(cdiv);
            $(cdiv).addClass("comment_unit");

            var cmnt_text = document.createElement("span");
            $(cmnt_text).css({ "line-height": "1.2" });

            if (r[key].IsOpen) {
                //для всех открытых комментариев создание строки критериев и текста коммента
                $(cmnt_text).html(r[key].CommentText || "&nbsp;");
                if (r[key].RatingRhyme != null || r[key].RatingTheme !== null || r[key].RatingGeneral !== null) {
                    var rating_string = (r[key].RatingRhyme || '*') + '/' + (r[key].RatingTheme || '*') + '/' + (r[key].RatingGeneral || '*');
                    $(cdiv).append(
                        $('<div></div>').addClass("pull-right comment_rating").html(rating_string)
                    );
                }

                if (is_shared === false) {
                    if (r[key].PricePlus === null) {
                        var pricePlusLink = document.createElement('span');
                        $(pricePlusLink).addClass('link_view').html('оценить комментарий').on('click', { pricePlusCommentId: r[key].Id }, function (pricePlusEvent) {
                            // генерация блока с оценкой комментария
                            var pricePlusLinkObj = this;
                            var star_comment_div = document.createElement("div");
                            $(star_comment_div).attr({ "title": "оценка комментария (столько же монет дополнительно получит автор комментария)" });
                            $(star_comment_div).rateit({ max: 10, step: 1 });

                            var inputPricePlusAnswer = document.createElement('input');
                            inputPricePlusAnswer.type = 'text';

                            var inputDescription = document.createElement('p');
                            $(inputDescription).html('Автор комментария получает количество монет, равное выставленной оценке. Ответ на комментарий является анонимным.');

                            var innerDiv = document.createElement('div');

                            var submitButton = document.createElement('button');
                            $(submitButton).html('Оценить комментарий').addClass('btn').on('click', function () {
                                var coinCount = $(star_comment_div).rateit("value");
                                var coinAnswer = $(inputPricePlusAnswer).val();
                                
                                $.ajax('{{conf.reqUrl}}/api/bout-unit/'+ pricePlusEvent.data.pricePlusCommentId + '/price-plus', {
                                  type: 'POST',
                                  contentType: 'application/json;charset=utf-8',
                                  xhrFields: {
                                    withCredentials: true
                                  },
                                  data: JSON.stringify({
                                    'Quantity': coinCount,
                                    'Answer': coinAnswer
                                  })
                                });

                                $("#out_window").hide();
                                $(pricePlusLinkObj).hide();
                            });

                            $(innerDiv).append('<h5>Оценка:</h5>', star_comment_div, '<h5>Ответ:</h5>', inputPricePlusAnswer, inputDescription, submitButton);

                            $("#out_header_name").html("Оценка комментария");
                            $("#out_content").html(innerDiv);
                            $("#out_window").show().focus();
                        });

                        $(cdiv).append(
                            $('<div></div>').addClass("pull-right").html(pricePlusLink)
                        );
                    }
                }
            }
            else {
                if (is_shared == true) {
                    //для всех закрытых комментариев общего назначения
                    $(cmnt_text).html("Оценка и комментарий скрыты").css({ "color": "#777" });
                }
                else {
                    //для всех скрытых комментариев частного назначения - ссылка Оплатить оценку
                    //cmnt.hide_count++;

                    $(cmnt_text).addClass("link_view").on("click", { materialId: material_id, id: r[key].Id, battleType: battle_type }, function (event) {
                        var rtrn_values = {
                            rtrn_function: function () {
                                add_comments_to_block(event.data.materialId, need_div, event.data.battleType, false, star_block_name);
                            }
                        };
                        open_bout_unit(event.data.id, rtrn_values);
                    }).html("Показать оценку и комментарий (стоимость: " + r[key].OpenPrice + plural_number(r[key].OpenPrice, ' монет', '', 'ы', '') + ")");
                }
            }

            if (is_shared === false) {
                //для всех комментариев частного назначения
                var plus_or_minus = '0';
                if (r[key].IsWin != null) {
                    plus_or_minus = (r[key].IsWin ? '+' : '-');
                };

                $(cdiv).append(
                    $('<div></div>').addClass("pull-left").css({
                        "cursor": "pointer",
                        "text-align": "center",
                        "width": "30px",
                        "margin-right": "5px",
                        "border-radius": "0 5px 5px 0",
                        "border": "1px solid #DAE2E8",
                        "border-left": "0",
                        "display": "inline-block"
                    }).append(
                        $('<div></div>').attr({ "title": "Технику подсчёта оценок можно узнать в правилах баттла" }).css({
                            "padding": "8px 4px",
                            "font-weight": "bold"
                        }).html(plus_or_minus)
                    )
                );
            }

            //общие функции для shared and non shared =======================================================
            var comment_opponent = document.createElement("span");

            if (is_shared === false) {
                if (r[key].RatingGeneral || r[key].RatingRhyme || r[key].RatingTheme) {
                    $(comment_opponent).css({ "font-size": "10px", "margin-top": "6px", "margin-right": "15px" })
                        .addClass("pull-right link_view")
                        .on("click", { comment_id: r[key].Id }, function (event) {
                            get_rival_flow(event.data.comment_id, battle_type);
                        }).html("соперник");
                }
            }

            var comment_date = document.createElement("span");
            $(comment_date).addClass("pull-right").css({ "color": "#777", "font-size": "10px", "margin-top": "6px", "margin-right": "4px" }).html(get_date_from_json(r[key].CreateDate));

            var cmnt_content_div = document.createElement("div");
            $(cmnt_content_div).css({ "margin": "3px", "word-wrap": "break-word", "color": "#000" }).append((rdac ? ('<span style="font-weight:bold; margin-right:3px">' + rdac + ' </span>') : ''), cmnt_text);

            $(cdiv).append($('<div></div>').append(cmnt_content_div, comment_date, comment_opponent));

            $(cdiv).append('<div class="fl_cl"></div>');
        }
        $(need_div).show();

        if (star_block_name) {
            $("#" + star_block_name).html(get_star_rating_const_string(battle_type, json_rtg)).show();
        }
    });
}

function get_star_rating_const_string(battle_type, json_rtg) {
    var star_div = document.createElement("div");

    for (var json_key in battle_types[battle_type].ocn) {
        var rdiv = document.createElement("div");
        $(rdiv).append(
            $('<div></div>').css({ "margin-top": "4px" })
                .attr({ "title": battle_types[battle_type].ocn[json_key].odesc })
                .append(
                    battle_types[battle_type].ocn[json_key].oname
                )
        );

        var rating_checked = 0;
        if (json_rtg[json_key].count > 0) {
            rating_checked = Math.round(json_rtg[json_key].total / json_rtg[json_key].count);
        }

        var star_temp_div = document.createElement('div');
        $(rdiv).append(star_temp_div);
        $(star_temp_div).rateit({
            max: battle_types[battle_type].ocn[json_key].qstars,
            step: 1,
            readonly: true,
            value: rating_checked
        });

        $(rdiv).append($('<div></div>').addClass("fl_cl"));
        star_div.appendChild(rdiv);

    }
    return star_div;

}


function get_star_rating_string(battle_type, block_number, json_array_div) {
    var is_tech_uch = true;
    if (battle_type == "text_battle") {
        is_tech_uch = ((battle_types[battle_type].top_users).indexOf(get_part_url('viewer_id')) != '-1') ? true : false; //является ли пользователь опытным в своём типе баттла
    }
    var star_div = document.createElement("div");

    for (var json_key in battle_types[battle_type].ocn) {
        var is_disabled_stars = ((is_tech_uch === false) && (json_key == "rhyme"));

        var rdiv = document.createElement("div");
        $(rdiv).append(
            $('<div></div>').css({ "margin-top": "4px" })
                .attr({ "title": battle_types[battle_type].ocn[json_key].odesc })
                .append(
                    battle_types[battle_type].ocn[json_key].oname,
                    is_disabled_stars ? '&nbsp;<span style="color:#777;">(не доступен)</span>' : ''
                )
        );


        json_array_div[json_key] = document.createElement("div");
        $(rdiv).append(json_array_div[json_key]);
        $(json_array_div[json_key]).rateit({
            max: battle_types[battle_type].ocn[json_key].qstars,
            step: 1,
            readonly: is_disabled_stars
        }).on('rated reset', function (event, value) {
            var total_sum = 0;
            for (var rated_key in battle_types[battle_type].ocn) {
                total_sum += parseInt($(json_array_div[rated_key]).rateit("value"));
            }
            $('#' + battle_type + '_itog_rating_' + block_number).html(total_sum);
        });

        $(rdiv).append($('<div></div>').addClass("fl_cl"));
        star_div.appendChild(rdiv);
    }
    return star_div;
}

function add_comment_to_material(comment_text, material_id, comment_sign, comments_div, reply_textarea, battle_type) {
    $.ajax('{{conf.reqUrl}}/api/material/' + material_id + '/comment', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      data: JSON.stringify({
        comment_text: encodeURIComponent(comment_text),
        material_id: material_id,
        comment_sign: comment_sign
      }),
      xhrFields: {
        withCredentials: true
      }
    }).done(function () {
        add_comments_to_block(material_id, comments_div, battle_type, true, null);
        $(reply_textarea).val('');
    });
}

function get_otbor_round_table(round_chislo, battle_type, battle_number) {
    $.ajax('{{conf.reqUrl}}/api/round-result', {
      type: 'GET',
      // Url params
      data: {
        round_chislo: round_chislo,
        is_show_only_wins: false,
        battle_type: battle_type,
        battle_number: battle_number
      },
      cache: true
    }).done(function (r) {
        if (r) {
            $('#out_header_name').html('Турнирная таблица');
            var inner_div = document.createElement("div");
            $('#out_content').html(inner_div);
            $('#out_window').show().focus();

            if (battle_type == "text_battle" && status_arr[round_chislo * 2].is_top == true) {
                fill_rating_table_top(r, battle_type, inner_div);
            }
            else if (battle_type == "audio_battle" && (round_chislo == 2 || round_chislo == 1)) {
                fill_rating_table_top(r, battle_type, inner_div);
            }
            else {
                fill_rating_table(r, battle_type, inner_div);
            }
        }
    });
}


function fill_rating_table_top(rd, battle_type, out_block) {
    for (var key = 0, max_key = rd.length; key < max_key; key++) {
        var t_div = document.createElement('div');
        $(t_div).addClass('top_users_rating_block');

        //first div with name link and number
        var first_div = document.createElement('div');
        $(first_div).css('padding', '5px');
        $(first_div).append('<span class="pull-right" style="color:#555; display:inline-block" title="дата сдачи">' + get_date_from_json(rd[key].d_send_text) + '</span>');
        $(first_div).append('<span>' + (parseInt(key, 10) + 1) + '.</span>');

        var nick_span = document.createElement('span');

        var user_name = ((battle_type == "beat_battle") ? rd[key].beatmaker_name : rd[key].nick_name);

        $(nick_span).html(user_name || '???')
            .addClass('link_view')
            .css('margin-left', '5px')
            .on('click', { flow_id: rd[key].flow_id, user_link: rd[key].user_link, user_name: user_name, battle_type: battle_type }, function (event) {
                get_flow(event.data.flow_id, event.data.user_link, event.data.user_name, "", event.data.battle_type);
            });
        $(first_div).append(nick_span);
        if (rd[key].user_link) {
            $(first_div).append('<span style="margin-left:4px"><a class="img_link_user" style="display:inline-block" href="' + rd[key].user_link + '" target="_blank"></a></span>');
        }
        $(first_div).append('<span class="fl_cl"></span>');
        $(t_div).append(first_div);
        //=================end of first div


        //second div
        var ocenka_top_user_total = parseFloat(rd[key].rating_theme_ave) + parseFloat(rd[key].rating_rhyme_ave) + parseFloat(rd[key].rating_general_ave);
        var ocenka_nar = parseInt(rd[key].voice_pro_count, 10) + parseInt(rd[key].voice_con_count, 10);

        var sdiv = '<span style="font-weight:bold">' + (ocenka_top_user_total + parseFloat(ocenka_nar / 10)).toFixed(2) + '</span>';
        sdiv += '<span> = </span>';
        sdiv += '<span class="under_dashed" title="Средняя оценка от проф. судей: ' + battle_types[battle_type].ocn.rhyme.oname + '">' + rd[key].rating_rhyme_ave.toFixed(2) + '</span>';
        sdiv += '<span> + </span>';
        sdiv += '<span class="under_dashed" title="Средняя оценка от проф. судей: ' + battle_types[battle_type].ocn.theme.oname + '">' + rd[key].rating_theme_ave.toFixed(2) + '</span>';
        sdiv += '<span> + </span>';
        sdiv += '<span class="under_dashed" title="Средняя оценка от проф. судей: ' + battle_types[battle_type].ocn.general.oname + '">' + rd[key].rating_general_ave.toFixed(2) + '</span>';
        //nar ocenka
        sdiv += '<span> + </span>';
        sdiv += '<span>(<span class="under_dashed" title="Народная оценка: голосов ЗА">' + rd[key].voice_pro_count + '</span>&nbsp;<span <span class="under_dashed" title="Народная оценка: голосов ПРОТИВ">' + rd[key].voice_con_count + '</span>)/10</span>';

        var second_div = document.createElement('div');
        $(second_div).css('padding', '5px 5px 5px 50px').append(sdiv);
        //end of second div
        $(t_div).append(second_div);

        $(out_block).append(t_div);
    }
}


function get_round_result(round_chislo, battle_type, battle_number) {
    $.ajax('{{conf.reqUrl}}/api/round-result', {
      type: 'GET',
      // Url params
      data: {
        round_chislo: round_chislo,
        is_show_only_wins: false,
        battle_type: battle_type,
        battle_number: battle_number
      },
      cache: true
    }).done(function (r) {
        ////if (r && r.length > 0) {
        if (battle_type == "text_battle" && round_chislo == 1) {
            for (var w_key = 0; w_key <= 1; w_key++) {
                if (r[w_key]) {
                    var winner_span = document.createElement('span');
                    $(winner_span).addClass('link_view')
                        .css('text-shadow', '#69C 1px 1px 1px')
                        .html(r[w_key].nick_name || '???')
                        .on('click', { flow_id: r[w_key].flow_id, user_link: r[w_key].user_link, nick_name: r[w_key].nick_name, battle_type: battle_type }, function (event) {
                            get_flow(event.data.flow_id, event.data.user_link, event.data.nick_name, "", event.data.battle_type);
                        });
                    $('#battle_place_' + w_key).html(winner_span);
                    if (r[w_key].user_link) {
                        $('#battle_place_' + w_key).append('<a href="' + r[w_key].user_link + '" target="_blank" style="margin-left:5px"><img src="Images/iel.png"/></a>');
                    }
                }
                else {
                    $('#battle_place_' + w_key).html('<span style="color:#777">текст не сдан</span>');
                }
                $('#priz_battle_place_' + w_key).html('приз: ' + (w_key == 0 ? '10' : '7') + ' голосов');
            }
            return;
        }

        $('#' + battle_type + '_grade_1_' + round_chislo).off('click').on('click', function () { get_otbor_round_table(round_chislo, battle_type, battle_number); return false; }).html('оценки');

        var uch_block = document.getElementById(battle_type + '_winners_1_' + round_chislo);
        $(uch_block).empty();
        //var uch_child;
        //while (uch_child == uch_block.firstChild) {
        //    uch_block.removeChild(uch_child);
        //}

        for (var key = 0, max_key = r.length; key < max_key; key++) {

            var a_element = document.createElement("span");
            var showing_name = (battle_type == "beat_battle") ? r[key].beatmaker_name : r[key].nick_name;
            var content_text = document.createTextNode(showing_name || '???');
            var span_content_text = document.createElement("span");
            $(span_content_text).addClass("link_view");
            span_content_text.appendChild(content_text);

            if (battle_type == "text_battle" && status_arr[round_chislo * 2].is_top == true) {
                var ocenka_top_user_total = parseFloat(r[key].rating_theme_ave) + parseFloat(r[key].rating_rhyme_ave) + parseFloat(r[key].rating_general_ave);
                span_content_text.setAttribute('title', ocenka_top_user_total + ' + (' + r[key].voice_pro_count + ' ' + r[key].voice_con_count + ')/10 = ' + (parseFloat(ocenka_top_user_total) + parseFloat((parseInt(r[key].voice_pro_count) + parseInt(r[key].voice_con_count)) / 10)).toFixed(2));
            }
            else {
                span_content_text.setAttribute('title', r[key].voice_pro_count + ' ' + r[key].voice_con_count + ' = ' + (r[key].voice_pro_count + r[key].voice_con_count));
            }

            if (battle_type == "text_battle") {
                if (key < round_chislo) {
                    if (user_author.nick_name.value && (user_author.nick_name.value == r[key].nick_name)) {
                        $('#sign_1_' + round_chislo).addClass('itog_plus').attr('title', 'Участник "' + user_author.nick_name.value + '" - прошедший в ' + status_arr[round_chislo].sname);

                        user_statuses.text_battle_uch_status = ((user_statuses.text_battle_uch_status == null) ? round_chislo : (parseInt(user_statuses.text_battle_uch_status) + parseInt(round_chislo)));
                        if (user_statuses.text_battle_status_max > round_chislo) {
                            user_statuses.text_battle_status_max = round_chislo;
                            $('#text_battle_rating_status').html('Статус в турнире: <b>' + status_arr[round_chislo].sname + '</b>');
                        };
                        $('#rm_' + round_chislo).addClass('backlight');
                    }
                }
                else if (key >= round_chislo) {
                    span_content_text.style.color = '#bbb';
                    if (user_author.nick_name.value && (user_author.nick_name.value == r[key].nick_name)) {
                        $('#sign_1_' + round_chislo).addClass('itog_minus').attr('title', 'Участник "' + user_author.nick_name.value + '" - непрошедший в ' + status_arr[round_chislo].sname + ' (участие в баттле можно продолжить с раунда, указанного в статусе турнира выше)');
                    }
                }
            }
            else if (battle_type == "audio_battle" || battle_type == "beat_battle") {
                if (round_chislo > 0) {
                    if (round_chislo == 16 && battle_type == "audio_battle") {
                        if (key >= 20) {
                            span_content_text.style.color = '#bbb';
                        }
                    }
                    else if (key >= round_chislo) {
                        span_content_text.style.color = '#bbb';
                    }
                }
            }

            var number_text = document.createTextNode((parseInt(key) + 1) + '. ');
            a_element.appendChild(number_text);
            a_element.appendChild(span_content_text);

            $(a_element).on('click', { flow_id: r[key].flow_id, user_link: r[key].user_link, user_name: showing_name, battle_type: battle_type }, function (event) {
                get_flow(event.data.flow_id, event.data.user_link, event.data.user_name, "", event.data.battle_type);
            });

            var div_elem = document.createElement('div');
            div_elem.style.padding = "1px";
            div_elem.style.position = 'relative';
            div_elem.style.wordWrap = 'break-word';

            if (r[key].user_link) {
                var user_link_a = document.createElement('a');
                user_link_a.setAttribute('class', 'img_link_user');
                user_link_a.setAttribute('className', 'img_link_user');
                user_link_a.style.cssFloat = 'right';
                user_link_a.style.styleFloat = 'right';
                user_link_a.href = r[key].user_link;
                user_link_a.target = '_blank';
                div_elem.appendChild(user_link_a);
            }

            div_elem.appendChild(a_element);
            //если был float: rigth делаем clear:both
            if (r[key].user_link) {
                var clear_span = document.createElement('span');
                clear_span.style.clear = 'both';
                div_elem.appendChild(clear_span);
            }

            uch_block.appendChild(div_elem);
        }
    });
}

function get_text_battle_uch_status() {
    $('#out_header_name').html("Статус в турнире текстового баттла Естественный");
    var inner_div = document.createElement('div');
    $('#out_content').html(inner_div);
    $('#out_window').show().focus();

    $(inner_div).html('<p>Данный баттл представляет собой зацикленную турнирную схему, где с каждым раундом начинается новый турнир. Поэтому Вы можете принимать участие одновременно в нескольких этапах турнира по ходу баттла.</p>');
    if (user_statuses.text_battle_uch_status > 0) {
        $(inner_div).append('<p>На текущий момент этапы, в которых Вы участвуете:</p>');

        var inner_ul = document.createElement("ul");
        $(inner_ul).addClass("listing");


        for (var uck in status_arr) {
            if (user_statuses.text_battle_uch_status & uck) {
                $(inner_ul).append('<li>' + status_arr[uck].sname + '</li>');
            }
        }
        $(inner_div).append(inner_ul);
    }

    var t_msg = (user_author.nick_name.value ? (user_author.nick_name.value + ' - ') : '') + 'участник этапа: ' + status_arr[user_statuses.text_battle_status_max].sname + ' текстового баттла Естественный';
    $(inner_div).append(
        $('<div></div>').addClass("max_uch_status_block").html(t_msg)
    );

    $(inner_div).append(
        $('<div></div>').css({ "text-align": "center", "margin-top": "4px" }).html(
            $('<span></span>').addClass("link_view").html("опубликовать на стене").on("click", function () { wall_post(t_msg) })
        )
    );
}

function show_settings(in_str) {
    $('#out_header_name').html('Настройки профиля');
    var setting_div = document.createElement("div");
    $('#out_content').html(setting_div);
    $('#out_window').show().focus();
    $(setting_div).append(
        $('<div></div>').css({ "position": "absolute", "right": "5px", "background-color": "#ccc", "padding": "4px", "display": "none" })
        .attr("id", "save_nick_msg")
        .html(in_str ? ('<span style="color:red">' + in_str + '</span>') : '')
    );
    if (in_str) {
        $("#save_nick_msg").show();
    }

    var entire_name_div = document.createElement('div');
    $(entire_name_div).addClass('setting_block');

    for (var uname in user_author) {
        var uname_div = document.createElement('div');
        $(uname_div).css({ 'margin-top': '5px' });
        $(uname_div).append('<label>' + user_author[uname].label + ': </label>');

        if (uname == "biography") {
            var uname_textarea = document.createElement("textarea");
            uname_textarea.id = uname + '_in';
            $(uname_textarea).css({ "width": "100%" })
                .attr({
                    placeholder: user_author[uname].desc,
                    rows: 4,
                    cols: 1
                })
                .val(user_author[uname].value ? user_author[uname].value : '');
            $(uname_div).append(uname_textarea);
        }
        else {
            var uname_input = document.createElement('input');
            uname_input.id = uname + '_in';
            $(uname_input).attr({
                size: user_author[uname].maxlength,
                type: 'text',
                maxlength: user_author[uname].maxlength,
                placeholder: user_author[uname].desc,
                value: (user_author[uname].value ? user_author[uname].value : '')
            }).addClass('text');
            $(uname_div).append(uname_input);
        }

        $(entire_name_div).append(uname_div);
    }

    $(entire_name_div).append('<div style="padding:5px 0 0 0"><button type="button" class="btn btn-primary" onclick="save_nn()">Сохранить</button></div>');
    $(setting_div).append(entire_name_div);

    $.ajax('{{conf.reqUrl}}/api/user-info', {
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
      var tmpIsPageShow = r['IsPageShow'];
      $(setting_div).append('<div class="setting_block" style="text-align:center"><label><span class="link_view">Разрешить показывать ссылку на Вашу страницу в социальной сети</span><input type="checkbox" onchange="set_is_page_show(this.checked); return false;" ' + (tmpIsPageShow ? 'checked="true"' : '') + false + '" /></label></div>');
    });


    VK.api("getUserSettings", function (r) {
        if ((r.response & 1) != 1) {
            var subs_cmnt_div = document.createElement("div");
            $(subs_cmnt_div).addClass("setting_block").css({ "text-align": "center", "margin": "auto", "width": "400px" });

            var subs_cmnt_in = document.createElement("span");
            subs_cmnt_in.appendChild(document.createTextNode("Разрешить приложению присылать уведомления (о новых оценках, комментариях, запуске новых раундов)"));
            $(subs_cmnt_in).on('click', function () {
                VK.callMethod("showSettingsBox", 1);
            }).addClass("link_view");
            subs_cmnt_div.appendChild(subs_cmnt_in);
            $(setting_div).append(subs_cmnt_div);
        }
    });

}

function save_nn() {
    var save_nick_msg = $('#save_nick_msg');
    save_nick_msg.empty();
    var data_json = {};
    for (var uname in user_author) {
        //проверка введённые данных
        var uname_new = $('#' + uname + '_in').val();
        uname_new = $.trim(uname_new);
        uname_new = text_work(uname_new);
        $('#' + uname + '_in').val(uname_new);
        if (uname_new.length > 0) {
            if (uname_new.length < user_author[uname].minlength) {
                save_nick_msg.css('color', 'red').html('  ' + user_author[uname].label + ': минимальное кол-во символов - ' + user_author[uname].minlength + '.').show().delay(2000).fadeOut('fast');
                return;
            }
            else if (uname_new.length > user_author[uname].maxlength) {
                save_nick_msg.css('color', 'red').html('  ' + user_author[uname].label + ': максимальное кол-во символов - ' + user_author[uname].maxlength + '.').show().delay(2000).fadeOut('fast');
                return;
            }
            else {
                data_json[uname] = encodeURIComponent(uname_new);
            }
        }
        else {
            data_json[uname] = '';
        }
    }
    
    $.ajax('{{conf.reqUrl}}/api/user-desc', {
      type: 'POST',
      contentType: 'application/json;charset=utf-8',
      data: JSON.stringify(data_json),
      xhrFields: {
        withCredentials: true
      },
      cache: false
    }).done(function (r) {
        if (r) {
            for (var uname in user_author) {
                if (r[uname] == '9') {
                    save_nick_msg.append('<span style="color:red; margin-left: 10px">' + user_author[uname].label + ': уже занят</span>').show().delay(2000).fadeOut('fast');
                }
            }
            if (!save_nick_msg.html()) {
                save_nick_msg.html('<span style="color:green">Успешно сохранено</span>').show().delay(2000).fadeOut('fast');
            }
            btlApp.viewModel.getCurrentUserProfile();
        }
    });
}

function plural_number(count, arg0, arg1, arg2, arg3) {
    var result = arg0;
    var last_digit = count % 10;
    var last_two_digits = count % 100;
    if (last_digit == 1 && last_two_digits != 11) {
        result += arg1;
    }
    else if ((last_digit == 2 && last_two_digits != 12)
    || (last_digit == 3 && last_two_digits != 13)
    || (last_digit == 4 && last_two_digits != 14))
        result += arg2;
    else
        result += arg3;
    return result;
}

function seconds_to_hms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}


// function get_main_track() {
    // ajaxRequest("get_main_track", {}, {}).done(function (r) {
        // $("#hiphopplayer_title").html('<span style="font-weight:bold">' + r.nick_name + '</span> - ' + r.mname);
        // $("#hiphopplayer_title_note").html(r.note);
        // $("#hiphopplayer").show();
        // $("#player_replacer").on("click", function () {
            // var mcontent_array = r.mcontent.split('_');
            // if (mcontent_array.length != 2) { sys_msg_show(); return; };
            // var mcontent_json = {
                // aids: mcontent_array[1]
            // };
            // if (parseInt(mcontent_array[0]) < 0) {
                // mcontent_json.gid = -parseInt(mcontent_array[0]);
            // }
            // else {
                // mcontent_json.uid = mcontent_array[0];
            // };
            // play_file_jquery(mcontent_json, "//vk.com/id" + r.uid, r.material_id);
            // ajaxRequest("add_material_view", { material_id: r.material_id }, {});
        // });
    // });
// }


function bj_play(material_id, audio_copy_data, file_url, pl, beat_artist, beat_title, author_link, lyrics_id) {
    if (lyrics_id) {
        $('#bj_track_text').off("click").on("click", { lyrics_id: lyrics_id }, function (event) {
            var inner_div = document.createElement("div");

            $(inner_div).html('<div class="upload_progress">&nbsp;</div>');

            popup_msg(beat_artist + " - " + beat_title, inner_div);
            VK.api('audio.getLyrics', { lyrics_id: event.data.lyrics_id }, function (r) {
                if (!r.response) {
                    $(inner_div).html("Текст аудиозаписи отсутствует");
                    return;
                }

                var textarea_rap = document.createElement("textarea");
                $(textarea_rap).addClass("flow_text_ready_class").css({ "width": "600px", "height": "600px" }).val(r.response.text);


                $(inner_div).html(textarea_rap);
            });
        }).show();
    }
    else {
        $('#bj_track_text').off("click").hide();
    }

    if (author_link) {
        $('#bj_beat_page_link').attr('href', author_link).show();
    }
    else {
        $('#bj_beat_page_link').attr('href', '#').hide();
    }
    $('#bj_copy_track_link').off('click').one('click', function () {
        $(this).hide();
        bj_copy_track(audio_copy_data, beat_artist, beat_title);
        if (material_id) {
            ajaxRequest("add_track_adding", { material_id: material_id }, {});
        }
    }).show();
    if (material_id) {
        $('#bj_comment_track_link').off('click').on('click', {}, function () {
            get_flow(material_id, author_link, beat_artist, beat_title, "audio_battle");
        }).show();
    }
    else {
        $('#bj_comment_track_link').off('click').hide();
    }
    construct_player(file_url, pl, beat_artist, beat_title);
};

function construct_player(file_url, pl, artist, title) {

    var comment_title = title ? (' - ' + title) : '';
    $('#player_comment').attr('title', (artist + comment_title)).html('<span style="font-weight:bold">' + artist + '</span>' + comment_title);

    if ($("#hiphopplayer").is(':visible')) {
        $("#hiphopplayer").hide();
        $("#hiphop_player").show();
    }
    else {
        $("#hiphop_player").show();
    }

    battleplayer.pause();
    battleplayer.setSrc(file_url);
    battleplayer.play();



    //var audio = document.createElement("audio");
    //if (audio != null && audio.canPlayType && audio.canPlayType("audio/mpeg") && player_id == "beat_player" && !($.browser.msie)
    //    && ) {

    //    }
    //else {
    //}

};


var zx = {
    get_materials_ocen_counters: function () {
        //получить счётчик - количество неоткрытых оценок
        $.ajax('{{conf.reqUrl}}/api/material-scope/unopened', {
          xhrFields: {
             withCredentials: true
          },
          cache: false
        }).done(function (r) {
          for (var i = 0; i < r.length; i++) {
            $('#not_open_counter_' + r[i].mtype).html(
                (r[i].gm_count > 0) ? ("+" + r[i].gm_count + "оц") : "&nbsp;"
            );
          }
        });
    },
    get_materials: function (in_mtype) {
        var gm_div = document.createElement("div");
        $("#lk_materials").html(gm_div);
        $(gm_div).html('<div class="upload_progress" style="margin-top:8px">&nbsp;</div>');

        $.ajax('{{conf.reqUrl}}/api/material', {
          data: {
            typeOfMaterial: in_mtype
          },
          xhrFields: {
             withCredentials: true
          },
          cache: true
        }).done(function (r) {
            var i_max = r.length;
            if (i_max == 0) {
                $(gm_div).css({ "padding": "8px", "text-align": "center" }).html("Нет произведений");
                return;
            }
            $(gm_div).empty();
            for (var i = 0; i < i_max; i++) {
                var idiv = document.createElement("div");
                $(idiv).addClass("material_div");
                $(idiv).on("click", { mtype: r[i].mtype, id: r[i].id, mname: r[i].mname }, function (event) {
                    var btl_type = event.data.mtype + "_battle";
                    var u_n = (btl_type == "beat_battle") ? user_author.beatmaker_name.value : user_author.nick_name.value;

                    get_flow(event.data.id, null, u_n, event.data.mname, btl_type, "material_container");
                    $('#btl_list_sub').hide();
                })

                var ispan = document.createElement("span");
                ispan.appendChild(document.createTextNode(r[i].mname))
                $(ispan).addClass("link_view");
                idiv.appendChild(ispan);

                idiv.appendChild(document.createElement("br"));

                var time_span = document.createElement('span');
                time_span.appendChild(document.createTextNode(moment(r[i].create_date).format('DD.MM.YYYY hh:mm:ss')));
                $(time_span).css({ "color": "#777", "font-size": "10px" });
                idiv.appendChild(time_span);

                if (r[i].bout_units_count_not_open > 0) {
                    var bucno = document.createElement('span');
                    bucno.appendChild(document.createTextNode("+" + r[i].bout_units_count_not_open + "оц"));
                    $(bucno).css({ "float": "right", "color": "#B61039" });
                    idiv.appendChild(bucno);

                };

                gm_div.appendChild(idiv);
            };
        });
    },
    get_referrer_users: function () {
        $.ajax('{{conf.reqUrl}}/api/referrer-users', {
           xhrFields: {
             withCredentials: true
           }
        }).done(function (r) {
            if (r) {
                $("#referrer_users").html(r.length);
            }
            $("#referrer_wrap").off().on("click", { user_arr: r }, function (event) {
                $('#flow_header_name').html('Пригласить друзей');
                $('#flow_content').empty();
                var user_count = (event.data.user_arr).length;

                if (user_count == 0) {
                    $('#flow_content').append('<p>Нет приглашённых пользователей</p>')
                }
                else {
                    $('#flow_content').append('<h5>Приглашённые пользователи</h5>')
                }
                for (var ilink = 0; ilink < user_count; ilink++) {
                    var a_link = document.createElement("a");
                    var str_link = "//vk.com/id" + event.data.user_arr[ilink];
                    $(a_link).attr({ "href": str_link, "target": "_blank" }).html(str_link);
                    var div_link = document.createElement("div");
                    div_link.appendChild(a_link);
                    $(div_link).css("padding", "4px");
                    $('#flow_content').append(div_link)
                }

                //$('#flow_content').append('<p>Способы приглашения пользователей:</p>');
                //var invite_friends_span = document.createElement("span");
                //$("#invite_friends_span").on("click",

                //$('#flow_content').append('<ul><li><span class="listing">Пригласить своих друзей</span></li><li>Раз</li></ul>');


                $('#flow_window').show().focus();
            });
        });
    }
}

// function show_marquee_dialog() {
    // $('#out_header_name').html("Размещение объявления в бегущей строке");
    // $('#out_window').show().focus();
    // var inner_div = document.createElement("div");
    // $('#out_content').html(inner_div);
    // $(inner_div).append('<div style="text-align:center;padding:4px; border:1px solid #f1f1f1">Стоимость: <span style="font-weight:bold">100</span> монет - <span style="font-weight:bold">3</span> суток (<span style="font-weight:bold">72</span> часа)</div>');
    // $(inner_div).append('<h5>Тематика объявлений</h5>');
    // $(inner_div).append($('<ul></ul>').addClass("listing").append(
            // "<li>продажа, покупка музыкального оборудования</li>",
            // "<li>предоставление услуг битмейкеров, продажа битов, минусов</li>",
            // "<li>предоставление услуг сведения треков</li>",
            // "<li>реклама страниц и пабликов исполнителей, битмейкеров</li>",
            // "<li>а также другие объявления, соответствующие тематике данного приложения</li>"
            // )
        // );

    // $(inner_div).append('<div style="text-align:center; padding:4px; border:1px solid #f1f1f1">На Вашем счете: <span style="font-weight:bold">' + btlApp.viewModel.currentUserProfile().balance() + plural_number(btlApp.viewModel.currentUserProfile().balance(), ' монет', '', 'ы', '') + '</span></div>');

    // if (btlApp.viewModel.currentUserProfile().balance() < 100) {
        // $(inner_div).append(
            // $('<p></p>').append("На вашем счете недостаточно средств: ",
                // $('<span></span>').addClass("link_view").html("приобрести 100 монет за 1 голос").on("click", function () {
                    // out_window_hide();
                    // showPaymentBox();
                // })
            // )
        // )
    // } else if (btlApp.viewModel.currentUserProfile().balance() >= 100) {
        // $(inner_div).append('<h5>Текст сообщения бегущей строки:</h5>');

        // var beg_string_input = document.createElement("input");
        // $(beg_string_input).attr({
            // "type": "text",
            // "maxlength": "60",
            // "placeholder": "текст сообщения бегущей строки"
        // }).css({ "width": "100%" });

        // $(inner_div).append($('<div></div>').html(beg_string_input));
        // $(inner_div).append('<div style="text-size:10px">*максимальная длина сообщения: 60 символов</div>');
        // $(inner_div).append('<h5>Прикрепляемая ссылка к тексту</h5>');

        // var beg_link_input = document.createElement('input');
        // $(beg_link_input).attr({
            // "type": "text",
            // "maxlength": "140"
        // }).css({ "width": "100%" }).val("//vk.com/");

        // $(inner_div).append($('<div></div>').html(beg_link_input));
        // $(inner_div).append('<div style="text-size:10px">*только внутренняя ссылка ВКонтакте</div>');
        // $(inner_div).append(
            // $('<div></div>').css({ "text-align": "center", "padding": "4px" }).html(
                // $('<div></div>').html(
                    // $('<button/>').prop("type", "button").addClass("btn btn-primary").html('Отправить заявку').on("click", function () {
                        // var beg_string_val = $(beg_string_input).val();
                        // var beg_link_val = $(beg_link_input).val();

                        // if (beg_string_val.length == 0) {
                            // $(beg_string_input).focus();
                            // return;
                        // }
                        // out_window_hide();
                        // ajaxRequest("beg_zayavka", { beg_string: beg_string_val, beg_link: beg_link_val }, {}).done(function () {
                            // event_msg_show("Заявка успешно отправлена");
                            // coin_transfer("IvanRave", 100, "Бегущая строка");
                        // });
                    // })
                // )
            // )
        // )
        // $(inner_div).append('<p>Заявка отправляется на модерацию. После отправки c Вашего баланса снимается (резервируется) 100 монет. В случае одобрения текст будет размещён в бегущей строке. В случае отклонения заявки монеты возвращаются в течение 24 часов.</p>');
    // }
// }

function coin_transfer(recipient_username, coin_sum, msg) {
    var jd = {
        recipient_username: recipient_username,
        coin_sum: coin_sum,
        msg: msg
    };
    ajaxRequest("coin_transfer", jd, {}).done(function () {
        out_window_hide();
        update_balance_string();
        event_msg_show("Средства успешно переведены");
    }).fail(function (e) {
        var json_e = JSON.parse(e.responseText)

        if (json_e.code >= 200 && json_e.code < 300) {
            out_window_hide();
            event_msg_show(json_e.message);
        }
    });
}

var dbt = {
    approve_battle: function (battle_id) {
        $('#out_header_name').html('Подтверждение баттла');
        $('#out_window').show().focus();
        var inner_div = document.createElement("div");
        $('#out_content').html(inner_div);
        var dopinfo = document.createElement("textarea");

        $(dopinfo).css({ "width": "95%", "height": "160px" });

        var dopinfo_send_button = document.createElement("button");

        $(dopinfo_send_button).prop("type", "button").addClass("btn btn-primary").on('click', function () {
            $.ajax('{{conf.reqUrl}}/api/log-record', {
              type: 'POST',
              contentType: 'application/json;charset=utf-8',
              data: JSON.stringify({
                LogSubject: 'BattleAdding',
                LogBody: "Заявка на подтверждение баттла : " + battle_id + ". Info: " + $(dopinfo).val()
              })
            }).done(function () {
                out_window_hide();
                popup_msg("Заявка на изменение баттла", "Успешно отправлено.");
            });

        }).html("Отправить");

        $(inner_div).append(
             "<p>Ваша заявка на добавление баттла принята. На данный момент только вы можете просмотреть информацию по вашему баттлу на главной странице приложения.</p>",
             "<p>Пришлите информацию, которую необходимо указать дополнительно (например призы или полный список судей):</p>",
              dopinfo,
              $('<div></div>').html(dopinfo_send_button),
             "<p>После внесённых изменений и при наличии минимум 50-ти монет на вашем счету баттл будет отображён на главной странице для всех</p>"
        );
    },
    add_battle: function () {
        $('#out_header_name').html('Заявка на добавление баттла');
        $('#out_window').show().focus();
        var inner_div = document.createElement("div");
        $('#out_content').html(inner_div);





        //вступительный текст
        $(inner_div).append(
            '<h5>Информация о вашем баттле на главной странице приложения</h5>',
            '<p>Оплачиваются только уникальные переходы пользователей на страницу вашего баттла: cтоимость одного уникального перехода - 5 монет.</p>'
        );

        var battle_type_input = document.createElement("select");

        for (var key in battle_types) {
            $(battle_type_input).append('<option value="' + key + '">' + battle_types[key].battle_name + '</option>');
        }
        $(inner_div).append(
            '<h5>Тип баттла:</h5>'
            , battle_type_input);

        //сезон, номер баттла
        var battle_number_input = document.createElement("input");
        $(battle_number_input).attr({ "type": "number" }).css({
            "width": "50px"
        }).val("1");

        $(inner_div).append(
            '<h5>Порядковый номер баттла (сезон):</h5>',
            battle_number_input
        );


        //название баттла
        var battle_name_input = document.createElement("input");
        $(battle_name_input).attr({
            "maxlength": 30,
            "type": "text"
        }).css({
            "width": "90%"
        });

        $(inner_div).append(
            '<h5>Название баттла:</h5>',
            battle_name_input,
            '<div style="font-size:10px">*от 3 до 30 символов</div>'
        );


        //ссылка на баттл
        var battle_link_input = document.createElement("input");
        $(battle_link_input).attr({
            "maxlength": 255,
            "type": "text"
        }).css({
            "width": "90%"
        }).val("//vk.com/");

        $(inner_div).append(
            '<h5>Ссылка на баттл:</h5>',
            battle_link_input,
            '<div style="font-size:10px">*только внутренняя ссылка ВКонтакте</div>'
        );




        var add_battle_button = document.createElement("button");

        $(add_battle_button).prop("type", "button").addClass("btn btn-primary").on("click", function () {
            //check all fields

            var adding_battle_info = {
                battle_type: $(battle_type_input).find(":selected").val(),
                battle_number: $(battle_number_input).val(),
                battle_name: $(battle_name_input).val(),
                battle_link: $(battle_link_input).val()
            };

            $.ajax('{{conf.reqUrl}}/api/log-record', {
              type: 'POST',
              contentType: 'application/json;charset=utf-8',
              data: JSON.stringify({
                LogSubject: 'BattleAdding',
                LogBody: "Заявка на добавление баттла: " + JSON.stringify(adding_battle_info)
              })
            }).done(function () {
                popup_msg("Заявка на добавление баттла", "Успешно отправлено. Вы можете проверить статус заявки через 24 часа.");
            });
        }).html("Отправить заявку");

        $(inner_div).append(
            $('<div></div>').css({ "text-align": "left", "margin-top": "8px" }).html(
                $('<div></div>').html(add_battle_button)
            )
        );


        $(inner_div).append(
            $('<p></p>').css({ "margin-top": "4px" }).html(
                'Подтверждение заявки происходит в течение 24 часов. При положительном ответе появится оповещение на главной странице и только вы сможете просматривать информацию по своему баттлу. После пополнения баланса минимум на 50 монет и дополнительного подтверждения, инфмормация по вашему баттлу станет общедоступна.'
            )
        );

    }
};