window.btlApp.viewModel = (function (ko, datacontext) {
    var vm = {};

    vm.battleTypeList = datacontext.getBattleTypeList();
    vm.battleSeasonList = ko.observableArray();
    vm.selectedBattleSeason = ko.observable();
    vm.currentUserProfile = ko.observable();
    vm.bankOperationList = ko.observableArray();
    vm.beatList = ko.observableArray();
    vm.error = ko.observable();

    vm.getBattleSeasonList = function () {
        datacontext.getBattleSeasonList().done(function (data) {
            var mappedList = $.map(data, function (item) {
                ////if (get_part_url("viewer_id") === "19064903")
                ////{
                ////    return datacontext.createBattleSeason(item);
                ////}
                ////else if (item.BtlType === 'text_battle')
                return datacontext.createBattleSeason(item);
            });

            vm.battleSeasonList(mappedList);
        }).fail(function () {
            vm.error("Ошибка загрузки списка баттлов");
        });
    };

    vm.getCurrentUserProfile = function () {
        datacontext.getCurrentUserProfile().done(function (data) {
            vm.currentUserProfile(datacontext.createUserProfile(data));
            // todo replace user_author
            user_author.nick_name.value = data.NickName;
            user_author.beatmaker_name.value = data.BeatmakerName;
            user_author.group_name.value = data.GroupName;
            user_author.biography.value = data.Biography;
        }).fail(function () {
            vm.error("Ошибка запроса данных о пользователе");
        });
    };

    vm.listWinnerMaterial = ko.observableArray();

    vm.getListWinnerMaterial = function () {
        datacontext.getMaterialList({ is_winner: true }).done(function (data) {
            var mappedList = $.map(data, function (item) {
                return datacontext.createMaterial(item);
            });

            vm.listWinnerMaterial(mappedList);

            // all vk ids (if user give access to id)
            var arrForGettingAvatar = [];
            $.each(vm.listWinnerMaterial(), function (arrIndex, arrElem) {
                if (arrElem.userProfile().userName) {
                    arrForGettingAvatar.push(parseInt(arrElem.userProfile().userName.substr(1), 10));
                }
            });
            
            // Load photo urls for audio winners
            // TODO: photos returned only in http format. Try to load with https
            // if (arrForGettingAvatar.length > 0) {
                // console.log(arrForGettingAvatar);
                // // request to VK getting avatars
                // VK.api("users.get", { uids: arrForGettingAvatar.join(","), fields: "photo" }, function (usersGetResponse) {
                    // var vkUserList = usersGetResponse.response;
                    // if (vkUserList) {
                        // $.each(vkUserList, function (vkUserIndex, vkUserElem) {
                            // $.each(vm.listWinnerMaterial(), function (btlMaterialIndex, btlMaterialElem) {
                                // if (("v" + vkUserElem.uid) === btlMaterialElem.userProfile().userName) {
                                    // btlMaterialElem.userProfile().photo(vkUserElem.photo);
                                // }
                            // });
                        // });
                    // }
                // });
            // }
        });
    };

    setTimeout(vm.getListWinnerMaterial, 5000);

    vm.getBankOperationList = function () {
        datacontext.getBankOperationList().done(function (data) {
            var mappedList = $.map(data, function (item) {
                return datacontext.createBankOperation(item);
            });

            vm.bankOperationList(mappedList);
        });
    };

    // chat
    ////vm.hub = $.connection.chatHub;


    ////vm.showLetterCatch = function () {
    ////    var bodyDom = document.createElement('div');

    ////    var submitFunction = function () {
    ////        // view rules
    ////        closeModalWindow();

    ////        $('#out_header_name').html(nickname);
    ////        $('#out_content').html('<div></div>');
    ////        $('#out_window').show().focus();
    ////    };


    ////};

    return vm;
})(ko, window.btlApp.datacontext);