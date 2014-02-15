window.btlApp = window.btlApp || {};

window.btlApp.datacontext = (function () {
    // Private
    function clearErrorMessage(entity) { entity.errorMessage(null); }

    function ajaxRequest(type, url, data, dataType) { // Ajax helper
        $('.spinner').show();

        var stringifyData = null;
        if (data) {
            if (data.toJson) {
                stringifyData = data.toJson();
            }
            else {
                stringifyData = JSON.stringify(data);
            }
        }

        var options = {
            dataType: dataType || "json",
            ////contentType: "application/json",
            cache: false,
            type: type,
            data: stringifyData,
            xhrFields: {
             withCredentials: true
            }
        };

        return $.ajax(url, options).always(function () {
            $(".spinner").hide();
        });
    }

    // routes (uqp = url query parameters)
    function userProfileUrl() { return "{{conf.reqUrl}}/api/userprofile/"; }
    function bankOperationUrl() { return "{{conf.reqUrl}}/api/bankoperation/"; }
    function roundMaterialUrl(uqp) { return "{{conf.reqUrl}}/api/roundmaterial/" + (uqp ? ("?" + $.param(uqp)) : ""); }
    function materialUrl(uqp) { return "{{conf.reqUrl}}/api/material/" + (uqp ? ("?" + $.param(uqp)) : ""); }
    function boutUnitUrl(uqp) { return "{{conf.reqUrl}}/api/boutunit/" + (uqp ? ("?" + $.param(uqp)) : ""); }
    function aboutUrl() { return "about.html"; }
    function theoryUrl() { return "napisanie_tekstov.html"; }

    function serviceUrl(methodName) { return "{{conf.reqUrl}}/wservice/wcfbase.svc/" + methodName; }

    // BattleType
    function getBattleTypeList() {
        var data = [{
            Id: 'audio',
            Title: 'аудио',
            FullTitle: 'Аудио баттл',
            IconName: 'music'
        }, {
            Id: 'text',
            Title: 'текстовый',
            FullTitle: 'Текстовый баттл',
            IconName: 'align-left'
        }, {
            Id: 'beat',
            Title: 'битмейкер',
            FullTitle: 'Битмейкер-баттл',
            IconName: 'headphones'
        }];

        var mappedBattleTypeList = $.map(data, function (item) {
            return createBattleType(item);
        });

        return mappedBattleTypeList;
    }

    function createBattleType(data) {
        return new datacontext.battleType(data); // from model
    }

    // Battle
    function getBattleSeasonList() {
        return ajaxRequest("GET", "{{conf.reqUrl}}/api/battle-season");
    }

    function createBattleSeason(data) {
        return new datacontext.battleSeason(data); // from model
    }

    function getAbout() {
        return ajaxRequest("GET", aboutUrl(), null, "HTML");
    }

    function getTheoryList() {
        return ajaxRequest("GET", theoryUrl(), null, "HTML");
    }

    // UserProfile
    function getCurrentUserProfile() {
        return ajaxRequest("GET", userProfileUrl());
    }

    function createUserProfile(data) {
        return new datacontext.userProfile(data); // from model
    }

    // BankOperation
    function getBankOperationList() {
        return ajaxRequest("GET", bankOperationUrl());
    }

    function createBankOperation(data) {
        return new datacontext.bankOperation(data); // from model
    }

    // Battle round
    function getCurrentBattleRound(battleSeasonId) {
        return ajaxRequest("GET", "{{conf.reqUrl}}/api/battle-season/" + battleSeasonId + "/battle-round/current-item");
    }

    function getHistoryBattleRoundList(battleId) {
        return ajaxRequest("GET", "{{conf.reqUrl}}/api/battle/" + battleId + "/battle-round/previous-list");
    }

    function createBattleRound(data, parent) {
        return new datacontext.battleRound(data, parent);
    }

    // Theme
    function createTheme(data) {
        return new datacontext.theme(data); // from model
    }

    // Round material
    function getAuthUserRoundMaterial(roundId) {
        return ajaxRequest("GET", roundMaterialUrl({ round_id: roundId }));
    }

    function createRoundMaterial(data, parent) {
        return new datacontext.roundMaterial(data, parent);
    }

    // Material
    function getMaterial(id) {
        return ajaxRequest("GET", materialUrl({ id: id }));
    }

    function createMaterial(data) {
        return new datacontext.material(data);
    }

    function getMaterialList(uqp) {
        return ajaxRequest("GET", materialUrl(uqp));
    }

    // bout unit
    function getBoutUnitList(material_id, is_show_free_comments) {
        return ajaxRequest("GET", boutUnitUrl({ material_id: material_id, is_show_free_comments: is_show_free_comments }));
    }

    function createBoutUnit(data, parent) {
        return new datacontext.boutUnit(data, parent);
    }

    var datacontext = {
        // battle type
        getBattleTypeList: getBattleTypeList,
        createBattleType: createBattleType,
        // battle
        getBattleSeasonList: getBattleSeasonList,
        createBattleSeason: createBattleSeason,
        getAbout: getAbout,
        getTheoryList: getTheoryList,
        // user profile
        getCurrentUserProfile: getCurrentUserProfile,
        createUserProfile: createUserProfile,
        // bank operation
        getBankOperationList: getBankOperationList,
        createBankOperation: createBankOperation,
        // battle round
        getCurrentBattleRound: getCurrentBattleRound,
        getHistoryBattleRoundList: getHistoryBattleRoundList,
        createBattleRound: createBattleRound,
        // theme
        createTheme: createTheme,
        // round material
        getAuthUserRoundMaterial: getAuthUserRoundMaterial,
        createRoundMaterial: createRoundMaterial,
        // material
        getMaterial: getMaterial,
        createMaterial: createMaterial,
        getMaterialList: getMaterialList,
        // bout unit
        getBoutUnitList: getBoutUnitList,
        createBoutUnit: createBoutUnit
    };

    return datacontext;
})();