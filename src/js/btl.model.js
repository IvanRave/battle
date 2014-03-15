(function (ko, datacontext) {

    // ================ helpers =========================
    function importThemeList(data) {
        return $.map(data || [],
            function (item) {
                return datacontext.createTheme(item);
            });
    }

    function importBattleRoundList(data, parent) {
        return $.map(data || [],
            function (item) {
                return datacontext.createBattleRound(item, parent);
            });
    }

    function importBoutUnitList(data, parent) {
        return $.map(data || [],
            function (item) {
                return datacontext.createBoutUnit(item, parent);
            });
    }

    function importMaterialList(data) {
        return $.map(data || [],
            function (item) {
                return datacontext.createMaterial(item);
            });
    }

    // =========== main classes =========================
    function userProfile(data) {
        var self = this;
        data = data || {};

        // Persisted properties
        self.userId = data.UserId;
        // only with user acception
        self.userName = data.UserName;
        self.nickName = ko.observable(data.NickName);
        self.groupName = ko.observable(data.GroupName);
        self.beatmakerName = ko.observable(data.BeatmakerName);
        self.biography = ko.observable(data.Biography);
        self.isPageShow = ko.observable(data.IsPageShow);
        self.balance = ko.observable(data.Balance);

        self.materialList = ko.observableArray();

        self.getMaterialList = function () {
            datacontext.getMaterialList().done(function (data) {
                self.materialList(importMaterialList(data));
            });
        };

        self.photo = ko.observable("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCABAAEADASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAwQCAAEH/8QAJRAAAgIBAwQCAwEAAAAAAAAAAQIAAxEEIWESIjEyQVEUcZET/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/APt86dDssCgknAgbLATHXJTZZaSKxtNDSsd3ff8AsCgPNhgZIdIw3V9/5Mh7KmxYMj7gXToVdgYAg5EWBlzI2zdd0D1EptbCkwtCuzNzAdVWtMDAAgPqwDhFzz4jXIbEKg4zM0UCoHOC33AxXqlZsOCp+47orqQwyDI9Z0lwFxn5llWf816vON4EaZouKH1MsQ5En1y7K3OItJyoP2IHl47WHExoSCjDmO4yJHW3495B9TAugaqwpX2ncnEfORmBq2KquADvjcZgHpaQQLG3PxK4WnJaoE7HiLnHmBLriAijmJQO1RxJ7G/IvAHqJYgwIGiMiT3VBxv5HgyicRmBCltlHawysddTURuSP2JtkB5hHTofjEDTamoDYk/oQXtsv7VGFiDToPjMVUA4gHTUEGB5PkygDAnAYnQP/9k=");

        self.showBalanceModal = function () {
            $('#out_header_name').html('Баланс');
            var setting_div = document.createElement("div");
            $('#out_content').html(setting_div);
            $('#out_window').show().focus();

            var get_user_battle_balance_div = document.createElement("div");
            $(get_user_battle_balance_div).addClass("setting_block").css({ "text-align": "center" }).html('&nbsp;');
            $(setting_div).append(get_user_battle_balance_div);

            $(get_user_battle_balance_div).html('Баттл-счёт: <span style="font-weight:bold">' + self.balance() + plural_number(self.balance(), ' монет', '', 'ы', '') + '</span>');

            var trasfer_coin_span = $('<span></span>').addClass('link_view').html('передать монеты другу').on("click", function () {
                $('#out_header_name').html('Перевод средств');
                var coin_transfer_div = document.createElement("div");
                $('#out_content').html(coin_transfer_div);
                $('#out_window').show().focus();
                $(coin_transfer_div).html('<h5 style="text-align:left">Перевод монет</h5>');

                var coin_amount_input = document.createElement('input');
                $(coin_amount_input).attr("type", "number").addClass("text").css({ "width": "200px" });

                var recipient_name_input = document.createElement('input');
                $(recipient_name_input).addClass("text").css({ "width": "200px" });

                var msg_input = document.createElement('input');
                $(msg_input).addClass("text").css({ "width": "200px" });

                var send_rqst_button = document.createElement('button');
                $(send_rqst_button).prop("type", "button").addClass("btn btn-primary").on("click", function () {
                    var coin_amount = $(coin_amount_input).val();

                    if (coin_amount < 1 || coin_amount > 250) {
                        popup_msg("Ошибка перевода", "Разрешенное количество монет: от 1 до 250");
                        return;
                    }

                    var recipient_name = $(recipient_name_input).val();
                    if (recipient_name.length < 2 || recipient_name.length > 30) {
                        popup_msg("Ошибка перевода", "Ник пользователя: количество символов от 2 до 30");
                        return;
                    }

                    coin_transfer(recipient_name, coin_amount, $(msg_input).val());
                }).html("Передать монеты");

                $(coin_transfer_div).css({ "text-align": "right", "width": "350px", "padding": "10px" }).append(
                    $('<div></div>').css({ "padding": "4px" }).append("Ник получателя:", recipient_name_input),
                    $('<div></div>').css({ "padding": "4px" }).append("Количество монет:", coin_amount_input),
                    $('<div></div>').css({ "padding": "4px" }).append("Комментарий:", msg_input),
                    $('<div></div>').css({ "padding": "4px" }).html(
                        $('<div></div>').html(send_rqst_button)
                    )
                );

            });

            $(get_user_battle_balance_div).append(
              $('<div></div>').css({ "padding-top": "2px" }).html(
                  $('<span></span>').addClass('link_view').html("приобрести 100 монет за 1 голос").on("click", {}, function () {
                      out_window_hide();
                      showPaymentBox();
                  })
              ),
              $('<div></div>').css({ "padding-top": "2px" }).html(trasfer_coin_span)
            );

            //=======================================bank_operations=================================================
            btlApp.viewModel.getBankOperationList();

            var bank_operations_list_div = document.createElement("div");
            $(bank_operations_list_div).addClass("setting_block");
            $(setting_div).append(bank_operations_list_div);

            $(bank_operations_list_div).attr({ 'data-bind': 'foreach: bankOperationList' });

            // TODO: move to html markup
            var t_div = document.createElement("div");

            $(t_div).addClass('clearfix').css({ "padding": "8px 0", "border-bottom": "1px dashed #ccc" }).append(
                $("<div></div>").addClass("pull-left").css({ "width": "40px", "margin-right": "10px", "text-align": "center" }).html('<span style="font-weight:bold" data-bind="text: saldo() + plural_number(saldo(), \' монет\', \'\', \'ы\', \'\')"></span>'),
                $("<div></div>").addClass("pull-left").css({ "width": "320px", "padding": "2px" }).html('<span data-bind="html: comment"></span>'),
                $("<div></div>").addClass("pull-right").css({ "width": "60px", "text-align": "right", "color": "#555" }).html('<span data-bind="text: moment(eventDate).format(\'DD.MM.YYYY hh:mm:ss\')"></span>')
            );

            $(bank_operations_list_div).html(t_div);

            ko.applyBindings(btlApp.viewModel, $(bank_operations_list_div).get(0));

            ////for (var i = 0, i_max = r.length; i < i_max; i++) {
            ////    var ubalance = parseInt(r[i].credit) - parseInt(r[i].debet);
            ////    var t_div = document.createElement("div");

            ////    $(t_div).css({ "padding": "8px 0", "border-bottom": "1px dashed #ccc" }).append(
            ////        $("<div></div>").addClass("pull-left").css({ "width": "40px", "margin-right": "10px", "text-align": "center" }).html('<span style="font-weight:bold">' + ubalance + '</span><br />' + plural_number(Math.abs(ubalance), ' монет', 'а', 'ы', '')),
            ////        $("<div></div>").addClass("pull-left").css({ "width": "320px", "padding": "2px" }).html(r[i].comment),
            ////        $("<div></div>").addClass("pull-right").css({ "width": "60px", "text-align": "right", "color": "#555" }).html(moment(r[i].event_date).format('DD.MM.YYYY hh:mm:ss')),
            ////        $("<div></div>").addClass("fl_cl")
            ////    );
            ////    $(bank_operations_list_div).append(t_div);
            ////}
        };

        ////self.createMaterial = function () {
        ////    var data = {
        ////        mtype: 'beat',
        ////        mcontent: '12312',
        ////        mdesc: 'Пояснение к тексту (одна строка 50 символов)',
        ////        mname: 'Название текста (может отличаться от темы) - по умолчанию Название темы'
        ////    };

        ////    var mt = datacontext.createMaterial(data);

        ////    datacontext.insertMaterial(mt).done(function () {

        ////    });
        ////};

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJSON(self); };
    }

    function battleType(data) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.title = data.Title;
        self.fullTitle = data.FullTitle;
        self.iconName = data.IconName;

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJSON(self); };
    }

    function battleSeason(data) {
        var self = this;
        data = data || {};

        // Persisted properties
        self.id = data.Id;
        self.btlId = data.BtlId;
        self.btlType = data.BtlType;
        self.btlLabel = data.BtlLabel;
        self.btlCount = data.BtlCount;
        self.isOneRound = data.IsOneRound;
        self.isWorkBattle = data.IsWorkBattle;
        self.roundCount = data.RoundCount;
        self.prize = data.Prize || 'Призов нет';

        self.ruleList = ko.observable();
        self.noteList = ko.observable();
        self.theoryList = ko.observable();

        // Computed properties
        self.fullBtlName = ko.computed(function () {
            return (self.btlCount > 1 ? self.btlCount + '-й ' : '') + '"' + self.btlLabel + '"';
        });

        self.historyBattleRoundList = ko.observableArray();

        self.getHistoryBattleRoundList = function () {
            // only once by request
            if (self.historyBattleRoundList().length === 0) {
                datacontext.getHistoryBattleRoundList(self.btlId).done(function (data) {
                    self.historyBattleRoundList(importBattleRoundList(data, self));
                }).fail(function () {
                    self.errorMessage("Ошибка получения списка прошедших раундов");
                });
            }
        };

        self.themeToSuggest = ko.observable('');

        self.suggestTheme = function () {
            if (self.themeToSuggest()) {
                ajaxRequest("add_theme",
                {
                    tname: self.themeToSuggest()
                }, {
                    progress: 1
                });

                self.themeToSuggest('');
            }
        };

        self.getRuleList = function () {
            // only once request
            if (self.ruleList()) { return; }

            datacontext.getAbout().done(function (data) {
                self.ruleList($(getObjectFromHtmlString(data, 'page_content')).html());
            }).fail(function () {
                self.errorMessage("Ошибка загрузки правил баттла");
            });
        };

        self.getNoteList = function () {
            if (self.noteList()) { return; }

            datacontext.getAbout().done(function (data) {
                self.noteList($(getObjectFromHtmlString(data, self.btlType + '_notes')).html());
            }).fail(function () {
                self.errorMessage("Ошибка загрузки примечаний к правилам");
            });
        };

        self.getTheoryList = function () {
            if (self.theoryList()) { return; }

            datacontext.getTheoryList().done(function (data) {
                self.theoryList($(getObjectFromHtmlString(data, 'page_content')).html());
            }).fail(function () {
                self.errorMessage("Ошибка загрузки теоретического материала");
            });
        };

        // Link properties
        self.currentBattleRound = ko.observable();

        self.getCurrentBattleRound = function () {
            datacontext.getCurrentBattleRound(self.id).done(function (data) {
                self.currentBattleRound(datacontext.createBattleRound(data, self));
                // Load battle material
                self.currentBattleRound().getAuthUserRoundMaterial();

                btl_event.current_round_id = data.Id;
            });
        };

        // text + audio
        self.btlTypeLink = ko.computed(function () {
            var result = null;
            $.each(window.btlApp.viewModel.battleTypeList, function (index, value) {
                if (value.id + '_battle' === self.btlType) {
                    result = value;
                    return false;
                }
            });

            return result;
        });

        self.selectBattleSeason = function () {
            hide_all_block();
            $('#event_msg_block').empty().hide();
            window.btlApp.viewModel.selectedBattleSeason(self);

            // load current battle round
            self.currentBattleRound(null);
            self.getCurrentBattleRound();

            $('.ext_' + self.btlType).hide();

            $("#battle_description").show();
        };

        self.showTournamentTable = function () {
            $('#event_msg_block').empty().hide();
            $('#battle_description').hide();
            $('.ext_' + self.btlType).hide();
            $('.ext_' + self.btlType + ':eq(2)').show();
            battle_types[self.btlType].menu_attr[2].menu_function();
        };

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJSON(self); };
    }

    function bankOperation(data) {
        var self = this;
        data = data || {};

        // Persisted properties
        self.credit = data.credit;
        self.debet = data.debet;
        self.comment = data.comment;
        self.eventDate = data.event_date;

        self.saldo = ko.computed(function () {
            return parseInt(self.credit, 10) - parseInt(self.debet, 10);
        });

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    // parent - battleSeason
    function battleRound(data, parent) {
        var self = this;
        data = data || {};

        self.parent = parent;
        // persisted properties
        self.id = data.Id;
        self.battleSeasonId = data.BattleSeasonId;
        self.startUnixTime = data.StartUnixTime;
        self.endUnixTime = data.EndUnixTime;
        self.lastUnixTime = data.LastUnixTime;
        self.judgingDesc = data.JudgingDesc;
        self.passRequirements = data.PassRequirements;
        self.roundMaterialCount = ko.observable(data.RoundMaterialCount);
        self.blockedRoundMaterialCount = ko.observable(data.BlockedRoundMaterialCount);
        self.themeList = importThemeList(data.ThemeList);

        // computed properties
        self.activeRoundMaterialCount = ko.computed(function () {
            return parseInt(self.roundMaterialCount(), 10) - parseInt(self.blockedRoundMaterialCount(), 10);
        });

        self.showRating = function () {
            var roundHistoryBlock = document.getElementById('round_history_block');
            get_rating(self.id, parent.btlType, roundHistoryBlock);
        };

        self.authUserRoundMaterial = ko.observable();

        self.getAuthUserRoundMaterial = function () {
            datacontext.getAuthUserRoundMaterial(self.id).done(function (roundMaterialData) {
                self.authUserRoundMaterial(datacontext.createRoundMaterial(roundMaterialData, self));
            }).fail(function (e) {
                if (e.statusText === 'RoundMaterial Not Found') {
                    self.authUserRoundMaterial(null);
                }
                else {
                    self.errorMessage("Ошибка получения данных при запросе произведения данного раунда");
                }
            });
        };

        self.showPassForm = function () {
            var uch_name_mt = (parent.btlType === "beat_battle") ? user_author.beatmaker_name.value : user_author.nick_name.value;

            if (!uch_name_mt) {
                show_settings('Укажите ' + ((parent.btlType === 'beat_battle') ? user_author.beatmaker_name.label : user_author.nick_name.label));
                return;
            }

            if (parent.btlType === "text_battle") {
                $('#event_msg_block').empty().hide();
                $('#battle_description').hide();
                $('.ext_' + parent.btlType).hide();
                $('.ext_' + parent.btlType + ':eq(0)').show();
                battle_types[parent.btlType].menu_attr[0].menu_function();
            }
            else if (parent.btlType === "beat_battle") {
                choose_track('beat_battle', 0);
            }
            else if (parent.btlType === "audio_battle") {
                choose_track('audio_battle', 0);
            }
        };

        self.showJudgeForm = function () {
            $('#event_msg_block').empty().hide();
            $('#battle_description').hide();
            $('.ext_' + parent.btlType).hide();
            $('.ext_' + parent.btlType + ':eq(1)').show();
            battle_types[parent.btlType].menu_attr[1].menu_function();
        };

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    function theme(data) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.createDate = data.CreateDate;
        self.ownerId = data.OwnerId;
        self.name = data.Name;

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    // parent - battleRound
    function roundMaterial(data, parent) {
        var self = this;
        data = data || {};

        self.materialId = data.MaterialId;
        self.roundId = data.RoundId;
        self.passDate = data.PassDate;
        self.voiceProCount = ko.observable(data.VoiceProCount);
        self.voiceConCount = ko.observable(data.VoiceConCount);
        self.ratingRhymeAve = ko.observable(data.RatingRhymeAve);
        self.ratingThemeAve = ko.observable(data.RatingThemeAve);
        self.ratingGeneralAve = ko.observable(data.RatingGeneralAve);

        // computed
        self.menuTitle = battle_types[parent.parent.btlType].menu_attr[0].menu_title;

        self.materialLink = ko.observable();

        self.getMaterialLink = function () {
            datacontext.getMaterial(self.materialId).done(function (data) {
                self.materialLink(datacontext.createMaterial(data));
                // get all comments
                self.materialLink().getBoutUnitList();
            }).fail(function () {
                self.errorMessage("Ошибка запроса произведения");
            });
        };

        self.show = function () {
            self.getMaterialLink();
            $('#event_msg_block').empty().hide();
            $('#battle_description').hide();
            $('.ext_' + parent.parent.btlType).hide();
            $('.ext_' + parent.parent.btlType + ':eq(0)').show();

            battle_types[parent.parent.btlType].menu_attr[0].menu_function();
        };

        var minLimit = -100;
        self.isBlocked = ko.computed(function () {
            return ((parseInt(self.voiceProCount(), 10) + parseInt(self.voiceConCount(), 10)) <= minLimit);
        });

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    function material(data) {
        var self = this;
        data = data || {};

        self.id = data.id;
        self.mtype = data.mtype;
        self.createDate = ko.observable(data.create_date);
        self.lastChangeDate = ko.observable(data.last_change_date);
        self.mname = ko.observable(data.mname);
        self.mcontent = ko.observable(data.mcontent);
        self.mdesc = ko.observable(data.mdesc);
        self.ownerId = data.owner_id;

        self.userProfile = ko.observable();

        if (data.UserProfileDto) {
            self.userProfile(datacontext.createUserProfile(data.UserProfileDto));
        }

        self.boutUnitList = ko.observableArray();

        self.playMaterial = function () {
            play_file_jquery({
                gid: battle_types[self.mtype + '_battle'].battle_group_id,
                aids: self.mcontent()
            }, null, null);
        };

        self.getBoutUnitList = function () {
            self.boutUnitList([]);
            datacontext.getBoutUnitList(self.id, false).done(function (data) {
                self.boutUnitList(importBoutUnitList(data, self));
            });
        };

        self.wallPost = function () {
            wall_post(self.mname() + '\n\n' + self.mcontent().split('<br />').join('\n'));
        };

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    // parent - material
    function boutUnit(data, parent) {
        var self = this;
        data = data || {};

        self.id = data.Id;
        self.boutId = data.BoutId;
        self.commentId = data.CommentId;
        self.commentText = data.CommentText;
        self.isWin = data.IsWin;
        self.ratingRhyme = data.RatingRhyme;
        self.ratingTheme = data.RatingTheme;
        self.ratingGeneral = data.RatingGeneral;
        self.createDate = data.CreateDate;
        self.cmaNickName = data.CmaNickName;
        self.openPrice = data.OpenPrice;
        self.pricePlus = ko.observable(data.PricePlus);
        self.isOpen = data.IsOpen;

        self.getRivalFlow = function () {
            get_rival_flow(self.id, parent.mtype + '_battle');
        };

        self.estimate = function () {
            if (self.isOpen === false) { return; }
            if (self.pricePlus() !== null) { return; }

            // генерация блока с оценкой комментария
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
                
                $.ajax('{{conf.reqUrl}}/api/bout-unit/'+ self.id + '/price-plus', {
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
                self.pricePlus(coinCount);
            });

            $(innerDiv).append('<h5>Оценка:</h5>', star_comment_div, '<h5>Ответ:</h5>', inputPricePlusAnswer, inputDescription, submitButton);

            $("#out_header_name").html("Оценка комментария");
            $("#out_content").html(innerDiv);
            $("#out_window").show().focus();
        };

        self.open = function () {
            if (self.isOpen === true) { return; }

            popup_msg("Открытие оценок", "Данная функция временно недоступна. Открыть оценки можно на главной странице баттла в разделе Мои документы (справа).");
            return;

            // todo: check balance
            // if (btlApp.viewModel.currentUserProfile().balance() < self.openPrice) {
                // showNotEnoughMoneyNotification();
                // return;
            // }
        };

        // Non-persisted properties
        self.errorMessage = ko.observable();
        self.toJson = function () { return ko.toJson(self); };
    }

    // =================== apply to datacontext ==========
    datacontext.userProfile = userProfile;
    datacontext.battleType = battleType;
    datacontext.battleSeason = battleSeason;
    datacontext.battleRound = battleRound;
    datacontext.bankOperation = bankOperation;
    datacontext.theme = theme;
    datacontext.roundMaterial = roundMaterial;
    datacontext.material = material;
    datacontext.boutUnit = boutUnit;
})(ko, window.btlApp.datacontext);