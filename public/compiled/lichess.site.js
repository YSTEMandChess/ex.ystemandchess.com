(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Lichess = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./standalones/util");
require("./timeago");
require("./standalones/trans");
require("./socket");
require("./main");

},{"./main":2,"./socket":3,"./standalones/trans":4,"./standalones/util":5,"./timeago":6}],2:[function(require,module,exports){
"use strict";
(function () {
    $.ajaxSetup({
        cache: false
    });
    $.ajaxTransport('script', function (s) {
        // Monkeypatch jQuery to load scripts with nonce. Upstream patch:
        // - https://github.com/jquery/jquery/pull/3766
        // - https://github.com/jquery/jquery/pull/3782
        // Original transport:
        // https://github.com/jquery/jquery/blob/master/src/ajax/script.js
        var script, callback;
        return {
            send: function (_, complete) {
                script = $("<script>").prop({
                    nonce: document.body.getAttribute('data-nonce'),
                    charset: s.scriptCharset,
                    src: s.url
                }).on("load error", callback = function (evt) {
                    script.remove();
                    callback = null;
                    if (evt) {
                        complete(evt.type === "error" ? 404 : 200, evt.type);
                    }
                });
                document.head.appendChild(script[0]);
            },
            abort: function () {
                if (callback) {
                    callback();
                }
            }
        };
    });
    $.userLink = function (u) {
        return $.userLinkLimit(u, false);
    };
    $.userLinkLimit = function (u, limit, klass) {
        var split = u.split(' ');
        var id = split.length == 1 ? split[0] : split[1];
        return u ? '<a class="user-link ulpt ' + (klass || '') + '" href="/@/' + id + '">' + (limit ? u.substring(0, limit) : u) + '</a>' : 'Anonymous';
    };
    lichess.announce = (() => {
        let timeout;
        const kill = () => $('#announce').remove();
        const set = (d) => {
            if (!d)
                return;
            kill();
            if (timeout)
                clearTimeout(timeout);
            if (d.msg) {
                $('body').append('<div id="announce" class="announce">' +
                    d.msg +
                    '<time class="timeago" datetime="' + d.date + '"></time>' +
                    '<div class="actions"><a class="close">X</a></div>' +
                    '</div>').find('#announce .close').click(kill);
                timeout = setTimeout(kill, new Date(d.date) - Date.now());
                lichess.pubsub.emit('content_loaded');
            }
        };
        set($('body').data('announce'));
        return set;
    })();
    lichess.socket = null;
    const $friendsBox = $('#friend_box');
    $.extend(true, lichess.StrongSocket.defaults, {
        events: {
            following_onlines: function (_, d) {
                d.users = d.d;
                $friendsBox.friends("set", d);
            },
            following_enters: function (_, d) {
                $friendsBox.friends('enters', d);
            },
            following_leaves: function (name) {
                $friendsBox.friends('leaves', name);
            },
            following_playing: function (name) {
                $friendsBox.friends('playing', name);
            },
            following_stopped_playing: function (name) {
                $friendsBox.friends('stopped_playing', name);
            },
            following_joined_study: function (name) {
                $friendsBox.friends('study_join', name);
            },
            following_left_study: function (name) {
                $friendsBox.friends('study_leave', name);
            },
            new_notification: function (e) {
                $('#notify-toggle').attr('data-count', e.unread || 0);
                lichess.sound.newPM();
            },
            redirect: function (o) {
                setTimeout(function () {
                    lichess.hasToReload = true;
                    lichess.redirect(o);
                }, 200);
            },
            tournamentReminder: function (data) {
                if ($('#announce').length || $('body').data("tournament-id") == data.id)
                    return;
                var url = '/tournament/' + data.id;
                $('body').append('<div id="announce">' +
                    '<a data-icon="g" class="text" href="' + url + '">' + data.name + '</a>' +
                    '<div class="actions">' +
                    '<a class="withdraw text" href="' + url + '/withdraw" data-icon="Z">Pause</a>' +
                    '<a class="text" href="' + url + '" data-icon="G">Resume</a>' +
                    '</div></div>').find('#announce .withdraw').click(function () {
                    $.post($(this).attr("href"));
                    $('#announce').remove();
                    return false;
                });
            },
            announce: lichess.announce
        },
        params: {},
        options: {
            name: "site",
            lagTag: null,
            isAuth: !!$('body').data('user')
        }
    });
    lichess.reverse = s => s.split('').reverse().join('');
    lichess.readServerFen = t => atob(lichess.reverse(t));
    lichess.userAutocomplete = ($input, opts) => {
        opts = opts || {};
        lichess.loadCssPath('autocomplete');
        return lichess.loadScript('javascripts/vendor/typeahead.jquery.min.js').done(function () {
            $input.typeahead({
                minLength: opts.minLength || 3,
            }, {
                hint: true,
                highlight: false,
                source: function (query, _, runAsync) {
                    if (query.trim().match(/^[a-z0-9][\w-]{2,29}$/i))
                        $.ajax({
                            url: '/player/autocomplete',
                            cache: true,
                            data: {
                                term: query,
                                friend: opts.friend ? 1 : 0,
                                tour: opts.tour,
                                object: 1
                            },
                            success(res) {
                                res = res.result;
                                // hack to fix typeahead limit bug
                                if (res.length === 10)
                                    res.push(null);
                                runAsync(res);
                            }
                        });
                },
                limit: 10,
                displayKey: 'name',
                templates: {
                    empty: '<div class="empty">No player found</div>',
                    pending: lichess.spinnerHtml,
                    suggestion: function (o) {
                        var tag = opts.tag || 'a';
                        return '<' + tag + ' class="ulpt user-link' + (o.online ? ' online' : '') + '" ' + (tag === 'a' ? '' : 'data-') + 'href="/@/' + o.name + '">' +
                            '<i class="line' + (o.patron ? ' patron' : '') + '"></i>' + (o.title ? '<span class="title">' + o.title + '</span>&nbsp;' : '') + o.name +
                            '</' + tag + '>';
                    }
                }
            }).on('typeahead:render', () => lichess.pubsub.emit('content_loaded'));
            if (opts.focus)
                $input.focus();
            if (opts.onSelect)
                $input
                    .on('typeahead:select', (_, sel) => opts.onSelect(sel))
                    .on('keypress', function (e) {
                    if (e.which == 10 || e.which == 13)
                        opts.onSelect($(this).val());
                });
        });
    };
    lichess.parseFen = function ($elem) {
        if (!window.Chessground)
            return setTimeout(function () {
                lichess.parseFen($elem);
            }, 500); // if not loaded yet
        // sometimes $elem is not a jQuery, can happen when content_loaded is triggered with random args
        if (!$elem || !$elem.each)
            $elem = $('.parse-fen');
        $elem.each(function () {
            var $this = $(this).removeClass('parse-fen');
            var lm = $this.data('lastmove');
            var lastMove = lm && (lm[1] === '@' ? [lm.slice(2)] : [lm[0] + lm[1], lm[2] + lm[3]]);
            var color = $this.data('color') || lichess.readServerFen($(this).data('y'));
            var ground = $this.data('chessground');
            var playable = !!$this.data('playable');
            var resizable = !!$this.data('resizable');
            var config = {
                coordinates: false,
                viewOnly: !playable,
                resizable: resizable,
                fen: $this.data('fen') || lichess.readServerFen($this.data('z')),
                lastMove: lastMove,
                drawable: { enabled: false, visible: false }
            };
            if (color)
                config.orientation = color;
            if (ground)
                ground.set(config);
            else
                $this.data('chessground', Chessground(this, config));
        });
    };
    $(function () {
        if (lichess.analyse)
            LichessAnalyse.boot(lichess.analyse);
        else if (lichess.user_analysis)
            startUserAnalysis(lichess.user_analysis);
        else if (lichess.study)
            startStudy(lichess.study);
        else if (lichess.practice)
            startPractice(lichess.practice);
        else if (lichess.relay)
            startRelay(lichess.relay);
        else if (lichess.puzzle)
            startPuzzle(lichess.puzzle);
        else if (lichess.tournament)
            startTournament(lichess.tournament);
        else if (lichess.simul)
            startSimul(lichess.simul);
        // delay so round starts first (just for perceived perf)
        lichess.requestIdleCallback(function () {
            $('#friend_box').friends();
            $('#main-wrap')
                .on('click', '.autoselect', function () {
                $(this).select();
            })
                .on('click', 'button.copy', function () {
                $('#' + $(this).data('rel')).select();
                document.execCommand('copy');
                $(this).attr('data-icon', 'E');
            });
            $('body').on('click', 'a.relation-button', function () {
                var $a = $(this).addClass('processing').css('opacity', 0.3);
                $.ajax({
                    url: $a.attr('href'),
                    type: 'post',
                    success: function (html) {
                        if (html.includes('relation-actions'))
                            $a.parent().replaceWith(html);
                        else
                            $a.replaceWith(html);
                    }
                });
                return false;
            });
            $('.mselect .button').on('click', function () {
                var $p = $(this).parent();
                $p.toggleClass('shown');
                setTimeout(function () {
                    var handler = function (e) {
                        if ($.contains($p[0], e.target))
                            return;
                        $p.removeClass('shown');
                        $('html').off('click', handler);
                    };
                    $('html').on('click', handler);
                }, 10);
            });
            document.body.addEventListener('mouseover', lichess.powertip.mouseover);
            function renderTimeago() {
                lichess.raf(() => lichess.timeago.render([].slice.call(document.getElementsByClassName('timeago'), 0, 99)));
            }
            function setTimeago(interval) {
                renderTimeago();
                setTimeout(() => setTimeago(interval * 1.1), interval);
            }
            setTimeago(1200);
            lichess.pubsub.on('content_loaded', renderTimeago);
            if (!window.customWS)
                setTimeout(function () {
                    if (lichess.socket === null) {
                        lichess.socket = lichess.StrongSocket("/socket/v4", false);
                    }
                }, 300);
            const initiatingHtml = '<div class="initiating">' + lichess.spinnerHtml + '</div>';
            lichess.challengeApp = (function () {
                var instance, booted;
                var $toggle = $('#challenge-toggle');
                $toggle.one('mouseover click', function () {
                    load();
                });
                var load = function (data) {
                    if (booted)
                        return;
                    booted = true;
                    var $el = $('#challenge-app').html(lichess.initiatingHtml);
                    lichess.loadCssPath('challenge');
                    lichess.loadScript(lichess.compiledScript('challenge')).done(function () {
                        instance = LichessChallenge.default($el[0], {
                            data: data,
                            show: function () {
                                if (!$('#challenge-app').is(':visible'))
                                    $toggle.click();
                            },
                            setCount: function (nb) {
                                $toggle.find('span').attr('data-count', nb);
                            },
                            pulse: function () {
                                $toggle.addClass('pulse');
                            }
                        });
                    });
                };
                return {
                    update: function (data) {
                        if (!instance)
                            load(data);
                        else
                            instance.update(data);
                    },
                    open: function () {
                        $toggle.click();
                    }
                };
            })();
            lichess.notifyApp = (() => {
                let instance, booted;
                const $toggle = $('#notify-toggle'), isVisible = () => $('#notify-app').is(':visible'), permissionChanged = () => {
                    $toggle.find('span').attr('data-icon', 'Notification' in window && Notification.permission == 'granted' ? '\ue00f' : '\xbf');
                    if (instance)
                        instance.redraw();
                };
                if ('permissions' in navigator)
                    navigator.permissions.query({ name: 'notifications' }).then(perm => {
                        perm.onchange = permissionChanged;
                    });
                permissionChanged();
                const load = function (data, incoming) {
                    if (booted)
                        return;
                    booted = true;
                    var $el = $('#notify-app').html(initiatingHtml);
                    lichess.loadCssPath('notify');
                    lichess.loadScript(lichess.compiledScript('notify')).done(function () {
                        instance = LichessNotify.default($el.empty()[0], {
                            data: data,
                            incoming: incoming,
                            isVisible: isVisible,
                            setCount(nb) {
                                $toggle.find('span').attr('data-count', nb);
                            },
                            show() {
                                if (!isVisible())
                                    $toggle.click();
                            },
                            setNotified() {
                                lichess.socket.send('notified');
                            },
                            pulse() {
                                $toggle.addClass('pulse');
                            }
                        });
                    });
                };
                $toggle.one('mouseover click', () => load()).click(() => {
                    if ('Notification' in window)
                        Notification.requestPermission(p => permissionChanged());
                    setTimeout(() => {
                        if (instance && isVisible())
                            instance.setVisible();
                    }, 200);
                });
                return {
                    update: function (data, incoming) {
                        if (!instance)
                            load(data, incoming);
                        else
                            instance.update(data, incoming);
                    }
                };
            })();
            window.addEventListener('resize', () => lichess.dispatchEvent(document.body, 'chessground.resize'));
            // dasher
            {
                let booted;
                $('#top .dasher .toggle').one('mouseover click', function () {
                    if (booted)
                        return;
                    booted = true;
                    const $el = $('#dasher_app').html(initiatingHtml), playing = $('body').hasClass('playing');
                    lichess.loadCssPath('dasher');
                    lichess.loadScript(lichess.compiledScript('dasher')).done(() => LichessDasher.default($el.empty()[0], { playing }));
                });
            }
            // cli
            {
                const $wrap = $('#clinput');
                if (!$wrap.length)
                    return;
                let booted;
                const $input = $wrap.find('input');
                const boot = () => {
                    if (booted)
                        return $.Deferred().resolve();
                    booted = true;
                    return lichess.loadScript(lichess.compiledScript('cli')).done(() => LichessCli.app($wrap, toggle));
                };
                const toggle = txt => {
                    boot().done(() => $input.val(txt || ''));
                    $('body').toggleClass('clinput');
                    if ($('body').hasClass('clinput'))
                        $input.focus();
                };
                $wrap.find('a').on('mouseover click', e => (e.type === 'mouseover' ? boot : toggle)());
                Mousetrap.bind('/', () => {
                    lichess.raf(() => toggle('/'));
                    return false;
                });
                Mousetrap.bind('s', () => lichess.raf(() => toggle()));
                if ($('body').hasClass('blind-mode'))
                    $input.one('focus', () => toggle());
            }
            $('.user-autocomplete').each(function () {
                const opts = {
                    focus: 1,
                    friend: $(this).data('friend'),
                    tag: $(this).data('tag')
                };
                if ($(this).attr('autofocus'))
                    lichess.userAutocomplete($(this), opts);
                else
                    $(this).one('focus', function () {
                        lichess.userAutocomplete($(this), opts);
                    });
            });
            $('#topnav-toggle').on('change', e => {
                document.body.classList.toggle('masked', e.target.checked);
            });
            lichess.loadInfiniteScroll = function (el) {
                $(el).each(function () {
                    if (!$('.pager a', this).length)
                        return;
                    var $scroller = $(this).infinitescroll({
                        navSelector: ".pager",
                        nextSelector: ".pager a",
                        itemSelector: ".infinitescroll .paginated",
                        errorCallback: function () {
                            $("#infscr-loading").remove();
                        },
                        loading: {
                            msg: $('<div id="infscr-loading">').html(lichess.spinnerHtml)
                        }
                    }, function () {
                        $("#infscr-loading").remove();
                        lichess.pubsub.emit('content_loaded');
                        var ids = [];
                        $(el).find('.paginated[data-dedup]').each(function () {
                            var id = $(this).data('dedup');
                            if (id) {
                                if (ids.includes(id))
                                    $(this).remove();
                                else
                                    ids.push(id);
                            }
                        });
                    }).find('div.pager').hide().end();
                    $scroller.parent().append($('<button class="inf-more button button-empty">&hellip;</button>').on('click', function () {
                        $scroller.infinitescroll('retrieve');
                    }));
                });
            };
            lichess.loadInfiniteScroll('.infinitescroll');
            $('#top').on('click', 'a.toggle', function () {
                var $p = $(this).parent();
                $p.toggleClass('shown');
                $p.siblings('.shown').removeClass('shown');
                lichess.pubsub.emit('top.toggle.' + $(this).attr('id'));
                setTimeout(function () {
                    var handler = function (e) {
                        if ($.contains($p[0], e.target))
                            return;
                        $p.removeClass('shown');
                        $('html').off('click', handler);
                    };
                    $('html').on('click', handler);
                }, 10);
                return false;
            });
            $('a.delete, input.delete').click(() => confirm('Delete?'));
            $('input.confirm, button.confirm').click(function () {
                return confirm($(this).attr('title') || 'Confirm this action?');
            });
            $('#main-wrap').on('click', 'a.bookmark', function () {
                var t = $(this).toggleClass("bookmarked");
                $.post(t.attr("href"));
                var count = (parseInt(t.text(), 10) || 0) + (t.hasClass("bookmarked") ? 1 : -1);
                t.find('span').html(count > 0 ? count : "");
                return false;
            });
            // still bind esc even in form fields
            Mousetrap.prototype.stopCallback = function (e, el, combo) {
                return combo !== 'esc' && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA');
            };
            Mousetrap.bind('esc', function () {
                var $oc = $('#modal-wrap .close');
                if ($oc.length)
                    $oc.trigger('click');
                else {
                    var $input = $(':focus');
                    if ($input.length)
                        $input.trigger('blur');
                }
                return false;
            });
            if (!lichess.storage.get('grid'))
                setTimeout(function () {
                    if (getComputedStyle(document.body).getPropertyValue('--grid'))
                        lichess.storage.set('grid', 1);
                    else
                        $.get(lichess.assetUrl('oops/browser.html'), html => $('body').prepend(html));
                }, 3000);
            /* A disgusting hack for a disgusting browser
             * Edge randomly fails to rasterize SVG on page load
             * A different SVG must be loaded so a new image can be rasterized */
            if (navigator.userAgent.indexOf('Edge/') > -1)
                setTimeout(function () {
                    const sprite = $('#piece-sprite');
                    sprite.attr('href', sprite.attr('href').replace('.css', '.external.css'));
                }, 1000);
            if (window.Fingerprint2)
                setTimeout(function () {
                    var t = Date.now();
                    new Fingerprint2({
                        excludeJsFonts: true
                    }).get(function (res) {
                        var $i = $('#signup-fp-input');
                        if ($i.length)
                            $i.val(res);
                        else
                            $.post('/auth/set-fp/' + res + '/' + (Date.now() - t));
                    });
                }, 500);
        });
    });
    lichess.sound = (function () {
        var api = {};
        var soundSet = $('body').data('sound-set');
        var speechStorage = lichess.storage.makeBoolean('speech.enabled');
        api.speech = function (v) {
            if (typeof v == 'undefined')
                return speechStorage.get();
            speechStorage.set(v);
            collection.clear();
        };
        api.volumeStorage = lichess.storage.make('sound-volume');
        api.defaultVolume = 0.7;
        var memoize = function (factory) {
            var loaded = {};
            var f = function (key) {
                if (!loaded[key])
                    loaded[key] = factory(key);
                return loaded[key];
            };
            f.clear = function () {
                loaded = {};
            };
            return f;
        };
        var names = {
            genericNotify: 'GenericNotify',
            move: 'Move',
            capture: 'Capture',
            explode: 'Explosion',
            lowtime: 'LowTime',
            victory: 'Victory',
            defeat: 'Defeat',
            draw: 'Draw',
            tournament1st: 'Tournament1st',
            tournament2nd: 'Tournament2nd',
            tournament3rd: 'Tournament3rd',
            tournamentOther: 'TournamentOther',
            berserk: 'Berserk',
            check: 'Check',
            newChallenge: 'NewChallenge',
            newPM: 'NewPM',
            confirmation: 'Confirmation',
            error: 'Error'
        };
        for (var i = 0; i <= 10; i++)
            names['countDown' + i] = 'CountDown' + i;
        var volumes = {
            lowtime: 0.5,
            explode: 0.35,
            confirmation: 0.5
        };
        var collection = new memoize(function (k) {
            var set = soundSet;
            if (set === 'music' || speechStorage.get()) {
                if (['move', 'capture', 'check'].includes(k))
                    return {
                        play: $.noop
                    };
                set = 'standard';
            }
            var baseUrl = lichess.assetUrl('sound', { noVersion: true });
            return new Howl({
                src: ['ogg', 'mp3'].map(function (ext) {
                    return [baseUrl, set, names[k] + '.' + ext].join('/');
                }),
                volume: volumes[k] || 1
            });
        });
        var enabled = function () {
            return soundSet !== 'silent';
        };
        Object.keys(names).forEach(function (name) {
            api[name] = function (text) {
                if (!enabled())
                    return;
                if (!text || !api.say(text)) {
                    Howler.volume(api.getVolume());
                    var sound = collection(name);
                    if (Howler.ctx && Howler.ctx.state == "suspended") {
                        Howler.ctx.resume().then(() => sound.play());
                    }
                    else {
                        sound.play();
                    }
                }
            };
        });
        api.say = function (text, cut, force) {
            if (!speechStorage.get() && !force)
                return false;
            var msg = text.text ? text : new SpeechSynthesisUtterance(text);
            msg.volume = api.getVolume();
            msg.lang = 'en-US';
            if (cut)
                speechSynthesis.cancel();
            speechSynthesis.speak(msg);
            console.log(`%c${msg.text}`, 'color: blue');
            return true;
        };
        api.load = function (name) {
            if (enabled() && name in names)
                collection(name);
        };
        api.setVolume = function (v) {
            api.volumeStorage.set(v);
            Howler.volume(v);
        };
        api.getVolume = () => {
            // garbage has been stored stored by accident (e972d5612d)
            const v = parseFloat(api.volumeStorage.get());
            return v >= 0 ? v : api.defaultVolume;
        };
        var publish = function () {
            lichess.pubsub.emit('sound_set', soundSet);
        };
        setTimeout(publish, 500);
        api.changeSet = function (s) {
            soundSet = s;
            collection.clear();
            publish();
        };
        api.warmup = function () {
            if (enabled()) {
                // See goldfire/howler.js#715
                Howler._autoResume(); // This resumes sound if suspended.
                Howler._autoSuspend(); // This starts the 30s timer to suspend.
            }
        };
        api.set = function () {
            return soundSet;
        };
        return api;
    })();
    lichess.widget('watchers', {
        _create: function () {
            this.list = this.element.find(".list");
            this.number = this.element.find(".number");
            lichess.pubsub.on('socket.in.crowd', data => this.set(data.watchers || data));
            lichess.watchersData && this.set(lichess.watchersData);
        },
        set: function (data) {
            lichess.watchersData = data;
            if (!data || !data.nb)
                return this.element.addClass('none');
            if (this.number.length)
                this.number.text(data.nb);
            if (data.users) {
                var tags = data.users.map($.userLink);
                if (data.anons === 1)
                    tags.push('Anonymous');
                else if (data.anons)
                    tags.push('Anonymous (' + data.anons + ')');
                this.list.html(tags.join(', '));
            }
            else if (!this.number.length)
                this.list.html(data.nb + ' players in the chat');
            this.element.removeClass('none');
        }
    });
    lichess.widget("friends", (function () {
        var getId = function (titleName) {
            return titleName.toLowerCase().replace(/^\w+\s/, '');
        };
        var makeUser = function (titleName) {
            var split = titleName.split(' ');
            return {
                id: split[split.length - 1].toLowerCase(),
                name: split[split.length - 1],
                title: (split.length > 1) ? split[0] : undefined,
                playing: false,
                studying: false,
                patron: false
            };
        };
        var renderUser = function (user) {
            var icon = '<i class="line' + (user.patron ? ' patron' : '') + '"></i>';
            var titleTag = user.title ? ('<span class="title"' + (user.title === 'BOT' ? ' data-bot' : '') + '>' + user.title + '</span>&nbsp;') : '';
            var url = '/@/' + user.name;
            var tvButton = user.playing ? '<a data-icon="1" class="tv ulpt" data-pt-pos="nw" href="' + url + '/tv" data-href="' + url + '"></a>' : '';
            var studyButton = user.studying ? '<a data-icon="4" class="friend-study" href="' + url + '/studyTv"></a>' : '';
            var rightButton = tvButton || studyButton;
            return '<div><a class="user-link ulpt" data-pt-pos="nw" href="' + url + '">' + icon + titleTag + user.name + '</a>' + rightButton + '</div>';
        };
        return {
            _create: function () {
                var self = this;
                var el = self.element;
                var hideStorage = lichess.storage.makeBoolean('friends-hide');
                self.$friendBoxTitle = el.find('.friend_box_title').click(function () {
                    el.find('.content_wrap').toggleNone(hideStorage.get());
                    hideStorage.toggle();
                });
                if (hideStorage.get() == 1)
                    el.find('.content_wrap').addClass('none');
                self.$nobody = el.find(".nobody");
                const data = el.data('preload');
                self.trans = lichess.trans(data.i18n);
                self.set(data);
            },
            repaint: function () {
                lichess.raf(function () {
                    var users = this.users, ids = Object.keys(users).sort();
                    this.$friendBoxTitle.html(this.trans.vdomPlural('nbFriendsOnline', ids.length, $('<strong>').text(ids.length)));
                    this.$nobody.toggleNone(!ids.length);
                    this.element.find('.list').html(ids.map(function (id) { return renderUser(users[id]); }).join(''));
                }.bind(this));
            },
            insert: function (titleName) {
                const id = getId(titleName);
                if (!this.users[id])
                    this.users[id] = makeUser(titleName);
                return this.users[id];
            },
            set: function (d) {
                this.users = {};
                let i;
                for (i in d.users)
                    this.insert(d.users[i]);
                for (i in d.playing)
                    this.insert(d.playing[i]).playing = true;
                for (i in d.studying)
                    this.insert(d.studying[i]).studying = true;
                for (i in d.patrons)
                    this.insert(d.patrons[i]).patron = true;
                this.repaint();
            },
            enters: function (d) {
                const user = this.insert(d.d);
                user.playing = d.playing;
                user.studying = d.studying;
                user.patron = d.patron;
                this.repaint();
            },
            leaves: function (titleName) {
                delete this.users[getId(titleName)];
                this.repaint();
            },
            playing: function (titleName) {
                this.insert(titleName).playing = true;
                this.repaint();
            },
            stopped_playing: function (titleName) {
                this.insert(titleName).playing = false;
                this.repaint();
            },
            study_join: function (titleName) {
                this.insert(titleName).studying = true;
                this.repaint();
            },
            study_leave: function (titleName) {
                this.insert(titleName).studying = false;
                this.repaint();
            }
        };
    })());
    lichess.widget("clock", {
        _create: function () {
            var self = this;
            // this.options.time: seconds Integer
            var target = this.options.time * 1000 + Date.now();
            var timeEl = this.element.find('.time')[0];
            var tick = function () {
                var remaining = target - Date.now();
                if (remaining <= 0)
                    clearInterval(self.interval);
                timeEl.innerHTML = self._formatMs(remaining);
            };
            this.interval = setInterval(tick, 1000);
            tick();
        },
        _pad: function (x) { return (x < 10 ? '0' : '') + x; },
        _formatMs: function (msTime) {
            var date = new Date(Math.max(0, msTime + 500));
            var hours = date.getUTCHours(), minutes = date.getUTCMinutes(), seconds = date.getUTCSeconds();
            if (hours > 0) {
                return hours + ':' + this._pad(minutes) + ':' + this._pad(seconds);
            }
            else {
                return minutes + ':' + this._pad(seconds);
            }
        }
    });
    $(function () {
        lichess.pubsub.on('content_loaded', lichess.parseFen);
        var socketOpened = false;
        function startWatching() {
            if (!socketOpened)
                return;
            var ids = [];
            $('.mini-board.live').removeClass("live").each(function () {
                ids.push(this.getAttribute("data-live"));
            });
            if (ids.length)
                lichess.socket.send("startWatching", ids.join(" "));
        }
        lichess.pubsub.on('content_loaded', startWatching);
        lichess.pubsub.on('socket.open', function () {
            socketOpened = true;
            startWatching();
        });
        lichess.requestIdleCallback(function () {
            lichess.parseFen();
            $('.chat__members').watchers();
            if (location.hash === '#blind' && !$('body').hasClass('blind-mode'))
                $.post('/toggle-blind-mode', { enable: 1, redirect: '/' }, lichess.reload);
        });
    });
    ///////////////////
    // tournament.js //
    ///////////////////
    function startTournament(cfg) {
        var element = document.querySelector('main.tour');
        $('body').data('tournament-id', cfg.data.id);
        var tournament;
        lichess.socket = lichess.StrongSocket('/tournament/' + cfg.data.id + '/socket/v4', cfg.data.socketVersion, {
            receive: function (t, d) {
                return tournament.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        cfg.element = element;
        cfg.$side = $('.tour__side').clone();
        cfg.$faq = $('.tour__faq').clone();
        tournament = LichessTournament.start(cfg);
    }
    function startSimul(cfg) {
        cfg.element = document.querySelector('main.simul');
        $('body').data('simul-id', cfg.data.id);
        var simul;
        lichess.socket = lichess.StrongSocket('/simul/' + cfg.data.id + '/socket/v4', cfg.socketVersion, {
            receive: function (t, d) {
                simul.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        cfg.$side = $('.simul__side').clone();
        simul = LichessSimul(cfg);
    }
    ////////////////
    // user_analysis.js //
    ////////////////
    function startUserAnalysis(cfg) {
        var analyse;
        cfg.initialPly = 'url';
        cfg.trans = lichess.trans(cfg.i18n);
        lichess.socket = lichess.StrongSocket('/analysis/socket/v4', false, {
            receive: function (t, d) {
                analyse.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        cfg.$side = $('.analyse__side').clone();
        analyse = LichessAnalyse.start(cfg);
    }
    ////////////////
    // study.js //
    ////////////////
    function startStudy(cfg) {
        var analyse;
        cfg.initialPly = 'url';
        lichess.socket = lichess.StrongSocket(cfg.socketUrl, cfg.socketVersion, {
            receive: function (t, d) {
                analyse.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        cfg.trans = lichess.trans(cfg.i18n);
        analyse = LichessAnalyse.start(cfg);
    }
    ////////////////
    // practice.js //
    ////////////////
    function startPractice(cfg) {
        var analyse;
        cfg.trans = lichess.trans(cfg.i18n);
        lichess.socket = lichess.StrongSocket('/analysis/socket/v4', false, {
            receive: function (t, d) {
                analyse.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        analyse = LichessAnalyse.start(cfg);
    }
    ////////////////
    // relay.js //
    ////////////////
    function startRelay(cfg) {
        var analyse;
        cfg.initialPly = 'url';
        lichess.socket = lichess.StrongSocket(cfg.socketUrl, cfg.socketVersion, {
            receive: function (t, d) {
                analyse.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        cfg.trans = lichess.trans(cfg.i18n);
        analyse = LichessAnalyse.start(cfg);
    }
    ////////////////
    // puzzle.js //
    ////////////////
    function startPuzzle(cfg) {
        var puzzle;
        cfg.element = document.querySelector('main.puzzle');
        lichess.socket = lichess.StrongSocket('/socket/v4', false, {
            receive: function (t, d) {
                puzzle.socketReceive(t, d);
            }
        });
        cfg.socketSend = lichess.socket.send;
        puzzle = LichessPuzzle.default(cfg);
    }
    ////////////////////
    // service worker //
    ////////////////////
    if ('serviceWorker' in navigator && 'Notification' in window && 'PushManager' in window) {
        const workerUrl = new URL(lichess.assetUrl(lichess.compiledScript('serviceWorker'), { sameDomain: true }), self.location.href);
        workerUrl.searchParams.set('asset-url', document.body.getAttribute('data-asset-url'));
        if (document.body.getAttribute('data-dev'))
            workerUrl.searchParams.set('dev', '1');
        const updateViaCache = document.body.getAttribute('data-dev') ? 'none' : 'all';
        navigator.serviceWorker.register(workerUrl.href, { scope: '/', updateViaCache }).then(reg => {
            const storage = lichess.storage.make('push-subscribed');
            const vapid = document.body.getAttribute('data-vapid');
            if (vapid && Notification.permission == 'granted')
                return reg.pushManager.getSubscription().then(sub => {
                    const resub = parseInt(storage.get() || '0', 10) + 43200000 < Date.now(); // 12 hours
                    const applicationServerKey = Uint8Array.from(atob(vapid), c => c.charCodeAt(0));
                    if (!sub || resub) {
                        return reg.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: applicationServerKey
                        }).then(sub => fetch('/push/subscribe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(sub)
                        }).then(res => {
                            if (res.ok)
                                storage.set('' + Date.now());
                            else
                                console.log('submitting push subscription failed', response.statusText);
                        }), err => {
                            console.log('push subscribe failed', err.message);
                            if (sub)
                                sub.unsubscribe();
                        });
                    }
                });
            else
                storage.remove();
        });
    }
})();

},{}],3:[function(require,module,exports){
"use strict";
function makeAckable(send) {
    var currentId = 1; // increment with each ackable message sent
    var messages = [];
    function resend() {
        var resendCutoff = performance.now() - 2500;
        messages.forEach(function (m) {
            if (m.at < resendCutoff)
                send(m.t, m.d);
        });
    }
    setInterval(resend, 1000);
    return {
        resend: resend,
        register: function (t, d) {
            d.a = currentId++;
            messages.push({
                t: t,
                d: d,
                at: performance.now()
            });
        },
        gotAck: function (id) {
            messages = messages.filter(function (m) {
                return m.d.a !== id;
            });
        }
    };
}
// versioned events, acks, retries, resync
lichess.StrongSocket = function (url, version, settings) {
    var settings = $.extend(true, {}, lichess.StrongSocket.defaults, settings);
    var options = settings.options;
    var ws;
    var pingSchedule;
    var connectSchedule;
    var ackable = makeAckable((t, d) => send(t, d));
    var lastPingTime = performance.now();
    var pongCount = 0;
    var averageLag = 0;
    var tryOtherUrl = false;
    var autoReconnect = true;
    var nbConnects = 0;
    var storage = lichess.storage.make('surl6');
    var connect = function () {
        destroy();
        autoReconnect = true;
        var params = $.param(settings.params);
        if (version !== false)
            params += (params ? '&' : '') + 'v=' + version;
        var fullUrl = options.protocol + '//' + baseUrl() + url + '?' + params;
        debug("connection attempt to " + fullUrl);
        try {
            ws = new WebSocket(fullUrl);
            ws.onerror = function (e) {
                onError(e);
            };
            ws.onclose = function () {
                lichess.pubsub.emit('socket.close');
                if (autoReconnect) {
                    debug('Will autoreconnect in ' + options.autoReconnectDelay);
                    scheduleConnect(options.autoReconnectDelay);
                }
            };
            ws.onopen = function () {
                debug("connected to " + fullUrl);
                onSuccess();
                $('body').removeClass('offline').addClass('online').addClass(nbConnects > 1 ? 'reconnected' : '');
                pingNow();
                lichess.pubsub.emit('socket.open');
                ackable.resend();
            };
            ws.onmessage = function (e) {
                if (e.data == 0)
                    return pong();
                const m = JSON.parse(e.data);
                if (m.t === 'n')
                    pong();
                handle(m);
            };
        }
        catch (e) {
            onError(e);
        }
        scheduleConnect(options.pingMaxLag);
    };
    var send = function (t, d, o, noRetry) {
        o = o || {};
        var msg = { t: t };
        if (d !== undefined) {
            if (o.withLag)
                d.l = Math.round(averageLag);
            if (o.millis >= 0)
                d.s = Math.round(o.millis * 0.1).toString(36);
            msg.d = d;
        }
        if (o.ackable) {
            msg.d = msg.d || {}; // can't ack message without data
            ackable.register(t, msg.d); // adds d.a, the ack ID we expect to get back
        }
        var message = JSON.stringify(msg);
        debug("send " + message);
        try {
            ws.send(message);
        }
        catch (e) {
            // maybe sent before socket opens,
            // try again a second later.
            if (!noRetry)
                setTimeout(function () {
                    send(t, msg.d, o, true);
                }, 1000);
        }
    };
    lichess.pubsub.on('socket.send', send);
    var scheduleConnect = function (delay) {
        if (options.idle)
            delay = 10 * 1000 + Math.random() * 10 * 1000;
        // debug('schedule connect ' + delay);
        clearTimeout(pingSchedule);
        clearTimeout(connectSchedule);
        connectSchedule = setTimeout(function () {
            $('body').addClass('offline').removeClass('online');
            tryOtherUrl = true;
            connect();
        }, delay);
    };
    var schedulePing = function (delay) {
        clearTimeout(pingSchedule);
        pingSchedule = setTimeout(pingNow, delay);
    };
    var pingNow = function () {
        clearTimeout(pingSchedule);
        clearTimeout(connectSchedule);
        var pingData = (options.isAuth && pongCount % 8 == 2) ? JSON.stringify({
            t: 'p',
            l: Math.round(0.1 * averageLag)
        }) : null;
        try {
            ws.send(pingData);
            lastPingTime = performance.now();
        }
        catch (e) {
            debug(e, true);
        }
        scheduleConnect(options.pingMaxLag);
    };
    var computePingDelay = function () {
        return options.pingDelay + (options.idle ? 1000 : 0);
    };
    var pong = function () {
        clearTimeout(connectSchedule);
        schedulePing(computePingDelay());
        var currentLag = Math.min(performance.now() - lastPingTime, 10000);
        pongCount++;
        // Average first 4 pings, then switch to decaying average.
        var mix = pongCount > 4 ? 0.1 : 1 / pongCount;
        averageLag += mix * (currentLag - averageLag);
        lichess.pubsub.emit('socket.lag', averageLag);
    };
    var handle = function (m) {
        if (m.v) {
            if (m.v <= version) {
                debug("already has event " + m.v);
                return;
            }
            // it's impossible but according to previous login, it happens nonetheless
            if (m.v > version + 1)
                return lichess.reload();
            version = m.v;
        }
        switch (m.t || false) {
            case false:
                break;
            case 'resync':
                lichess.reload();
                break;
            case 'ack':
                ackable.gotAck(m.d);
                break;
            default:
                lichess.pubsub.emit('socket.in.' + m.t, m.d);
                var processed = settings.receive && settings.receive(m.t, m.d);
                if (!processed && settings.events[m.t])
                    settings.events[m.t](m.d || null, m);
        }
    };
    var debug = function (msg, always) {
        if (always || options.debug) {
            console.debug("[" + options.name + " " + settings.params.sri + "]", msg);
        }
    };
    var destroy = function () {
        clearTimeout(pingSchedule);
        clearTimeout(connectSchedule);
        disconnect();
        ws = null;
    };
    var disconnect = function () {
        if (ws) {
            debug("Disconnect");
            autoReconnect = false;
            ws.onerror = ws.onclose = ws.onopen = ws.onmessage = $.noop;
            ws.close();
        }
    };
    var onError = function (e) {
        options.debug = true;
        debug('error: ' + JSON.stringify(e));
        tryOtherUrl = true;
        clearTimeout(pingSchedule);
    };
    var onSuccess = function () {
        nbConnects++;
        if (nbConnects == 1) {
            options.onFirstConnect();
            var disconnectTimeout;
            lichess.idleTimer(10 * 60 * 1000, function () {
                options.idle = true;
                disconnectTimeout = setTimeout(destroy, 2 * 60 * 60 * 1000);
            }, function () {
                options.idle = false;
                if (ws)
                    clearTimeout(disconnectTimeout);
                else
                    location.reload();
            });
        }
    };
    const baseUrls = document.body.getAttribute('data-socket-domains').split(',');
    const baseUrl = function () {
        let url = storage.get();
        if (!url) {
            url = baseUrls[0];
            storage.set(url);
        }
        else if (tryOtherUrl) {
            tryOtherUrl = false;
            url = baseUrls[(baseUrls.indexOf(url) + 1) % baseUrls.length];
            storage.set(url);
        }
        return url;
    };
    connect();
    window.addEventListener('unload', destroy);
    return {
        disconnect: disconnect,
        send: send,
        options: options,
        pingInterval: function () {
            return computePingDelay() + averageLag;
        },
        averageLag: function () {
            return averageLag;
        },
        getVersion: function () {
            return version;
        }
    };
};
lichess.StrongSocket.defaults = {
    events: {
        fen: function (e) {
            $('.mini-board-' + e.id).each(function () {
                lichess.parseFen($(this).data("fen", e.fen).data("lastmove", e.lm));
            });
        },
        challenges: function (d) {
            lichess.challengeApp.update(d);
        },
        notifications: function (d) {
            lichess.notifyApp.update(d, true);
        }
    },
    params: {
        sri: lichess.sri
    },
    options: {
        name: "unnamed",
        idle: false,
        pingMaxLag: 9000,
        pingDelay: 2500,
        autoReconnectDelay: 3500,
        protocol: location.protocol === 'https:' ? 'wss:' : 'ws:',
        onFirstConnect: $.noop
    }
};

},{}],4:[function(require,module,exports){
"use strict";
lichess.trans = function (i18n) {
    var format = function (str, args) {
        if (args.length && str.includes('$s'))
            for (var i = 1; i < 4; i++)
                str = str.replace('%' + i + '$s', args[i - 1]);
        args.forEach(function (arg) {
            str = str.replace('%s', arg);
        });
        return str;
    };
    var list = function (str, args) {
        var segments = str.split(/(%(?:\d\$)?s)/g);
        for (var i = 1; i <= args.length; i++) {
            var pos = segments.indexOf('%' + i + '$s');
            if (pos !== -1)
                segments[pos] = args[i - 1];
        }
        for (var i = 0; i < args.length; i++) {
            var pos = segments.indexOf('%s');
            if (pos === -1)
                break;
            segments[pos] = args[i];
        }
        return segments;
    };
    var trans = function (key) {
        var str = i18n[key];
        return str ? format(str, Array.prototype.slice.call(arguments, 1)) : key;
    };
    trans.plural = function (key, count) {
        var pluralKey = key + ':' + lichess.quantity(count);
        var str = i18n[pluralKey] || i18n[key];
        return str ? format(str, Array.prototype.slice.call(arguments, 1)) : key;
    };
    trans.noarg = function (key) {
        // optimisation for translations without arguments
        return i18n[key] || key;
    };
    trans.vdom = function (key) {
        var str = i18n[key];
        return str ? list(str, Array.prototype.slice.call(arguments, 1)) : [key];
    };
    trans.vdomPlural = function (key, count) {
        var pluralKey = key + ':' + lichess.quantity(count);
        var str = i18n[pluralKey] || i18n[key];
        return str ? list(str, Array.prototype.slice.call(arguments, 2)) : [key];
    };
    return trans;
};

},{}],5:[function(require,module,exports){
"use strict";
lichess = window.lichess || {};
lichess.engineName = 'Stockfish 11+';
lichess.raf = window.requestAnimationFrame.bind(window);
lichess.requestIdleCallback = (window.requestIdleCallback || window.setTimeout).bind(window);
lichess.dispatchEvent = (el, eventName) => el.dispatchEvent(new Event(eventName));
lichess.hasTouchEvents = 'ontouchstart' in window;
// Unique id for the current document/navigation. Should be different after
// each page load and for each tab. Should be unpredictable and secret while
// in use.
try {
    const data = window.crypto.getRandomValues(new Uint8Array(9));
    lichess.sri = btoa(String.fromCharCode(...data)).replace(/[/+]/g, '_');
}
catch (_) {
    lichess.sri = Math.random().toString(36).slice(2, 12);
}
lichess.isCol1 = (() => {
    let isCol1Cache = 'init'; // 'init' | 'rec' | boolean
    return () => {
        if (typeof isCol1Cache == 'string') {
            if (isCol1Cache == 'init') { // only once
                window.addEventListener('resize', () => { isCol1Cache = 'rec'; }); // recompute on resize
                if (navigator.userAgent.indexOf('Edge/') > -1) // edge gets false positive on page load, fix later
                    window.lichess.raf(() => { isCol1Cache = 'rec'; });
            }
            isCol1Cache = !!getComputedStyle(document.body).getPropertyValue('--col1');
        }
        return isCol1Cache;
    };
})();
{
    const buildStorage = (storage) => {
        const api = {
            get: k => storage.getItem(k),
            set: (k, v) => storage.setItem(k, v),
            fire: (k, v) => storage.setItem(k, JSON.stringify({
                sri: lichess.sri,
                nonce: Math.random(),
                value: v
            })),
            remove: k => storage.removeItem(k),
            make: k => ({
                get: () => api.get(k),
                set: v => api.set(k, v),
                fire: v => api.fire(k, v),
                remove: () => api.remove(k),
                listen: f => window.addEventListener('storage', e => {
                    if (e.key !== k || e.storageArea !== storage || e.newValue === null)
                        return;
                    let parsed;
                    try {
                        parsed = JSON.parse(e.newValue);
                    }
                    catch (_) {
                        return;
                    }
                    // check sri, because Safari fires events also in the original
                    // document when there are multiple tabs
                    if (parsed.sri && parsed.sri !== lichess.sri)
                        f(parsed);
                })
            }),
            makeBoolean: k => ({
                get: () => api.get(k) == 1,
                set: v => api.set(k, v ? 1 : 0),
                toggle: () => api.set(k, api.get(k) == 1 ? 0 : 1)
            })
        };
        return api;
    };
    lichess.storage = buildStorage(window.localStorage);
    lichess.tempStorage = buildStorage(window.sessionStorage);
}
lichess.once = (key, mod) => {
    if (mod === 'always')
        return true;
    if (!lichess.storage.get(key)) {
        lichess.storage.set(key, 1);
        return true;
    }
    return false;
};
lichess.debounce = (func, wait, immediate) => {
    let timeout, lastBounce = 0;
    return function () {
        let context = this, args = arguments, elapsed = performance.now() - lastBounce;
        lastBounce = performance.now();
        let later = () => {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        if (immediate && elapsed > wait)
            func.apply(context, args);
        else
            timeout = setTimeout(later, wait);
    };
};
lichess.powertip = (() => {
    function containedIn(el, container) {
        return container && container.contains(el);
    }
    function inCrosstable(el) {
        return containedIn(el, document.querySelector('.crosstable'));
    }
    function onPowertipPreRender(id, preload) {
        return function () {
            let url = ($(this).data('href') || $(this).attr('href')).replace(/\?.+$/, '');
            if (preload)
                preload(url);
            $.ajax({
                url: url + '/mini',
                success: function (html) {
                    $('#' + id).html(html);
                    lichess.pubsub.emit('content_loaded');
                }
            });
        };
    }
    ;
    let uptA = (url, icon) => '<a class="btn-rack__btn" href="' + url + '" data-icon="' + icon + '"></a>';
    let userPowertip = (el, pos) => {
        pos = pos || el.getAttribute('data-pt-pos') || (inCrosstable(el) ? 'n' : 's');
        $(el).removeClass('ulpt').powerTip({
            intentPollInterval: 200,
            placement: pos,
            smartPlacement: true,
            mouseOnToPopup: true,
            closeDelay: 200
        }).data('powertip', ' ').on({
            powerTipRender: onPowertipPreRender('powerTip', (url) => {
                const u = url.substr(3);
                const name = $(el).data('name') || $(el).html();
                $('#powerTip').html('<div class="upt__info"><div class="upt__info__top"><span class="user-link offline">' + name + '</span></div></div><div class="upt__actions btn-rack">' +
                    uptA('/@/' + u + '/tv', '1') +
                    uptA('/inbox/new?user=' + u, 'c') +
                    uptA('/?user=' + u + '#friend', 'U') +
                    '<a class="btn-rack__btn relation-button" disabled></a></div>');
            })
        });
    };
    function gamePowertip(el) {
        $(el).removeClass('glpt').powerTip({
            intentPollInterval: 200,
            placement: inCrosstable(el) ? 'n' : 'w',
            smartPlacement: true,
            mouseOnToPopup: true,
            closeDelay: 200,
            popupId: 'miniGame'
        }).on({
            powerTipPreRender: onPowertipPreRender('miniGame')
        }).data('powertip', lichess.spinnerHtml);
    }
    ;
    function powerTipWith(el, ev, f) {
        if (lichess.isHoverable()) {
            f(el);
            $.powerTip.show(el, ev);
        }
    }
    ;
    function onIdleForAll(par, sel, fun) {
        lichess.requestIdleCallback(function () {
            Array.prototype.forEach.call(par.querySelectorAll(sel), fun);
        });
    }
    return {
        mouseover(e) {
            var t = e.target, cl = t.classList;
            if (cl.contains('ulpt'))
                powerTipWith(t, e, userPowertip);
            else if (cl.contains('glpt'))
                powerTipWith(t, e, gamePowertip);
        },
        manualGameIn(parent) {
            onIdleForAll(parent, '.glpt', gamePowertip);
        },
        manualUserIn(parent) {
            onIdleForAll(parent, '.ulpt', (el) => userPowertip(el));
        }
    };
})();
lichess.widget = (name, prototype) => {
    var constructor = $[name] = function (options, element) {
        this.element = $(element);
        $.data(element, name, this);
        this.options = options;
        this._create();
    };
    constructor.prototype = prototype;
    $.fn[name] = function (method) {
        var returnValue = this;
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof method === 'string')
            this.each(function () {
                var instance = $.data(this, name);
                if (!instance)
                    return;
                if (!$.isFunction(instance[method]) || method.charAt(0) === "_")
                    return $.error("no such method '" + method + "' for " + name + " widget instance");
                returnValue = instance[method].apply(instance, args);
            });
        else
            this.each(function () {
                if (!$.data(this, name))
                    $.data(this, name, new constructor(method, this));
            });
        return returnValue;
    };
};
lichess.isHoverable = () => {
    if (typeof lichess.hoverable === 'undefined')
        lichess.hoverable = !lichess.hasTouchEvents /* Firefox <= 63 */ || !!getComputedStyle(document.body).getPropertyValue('--hoverable');
    return lichess.hoverable;
};
lichess.spinnerHtml = '<div class="spinner"><svg viewBox="0 0 40 40"><circle cx=20 cy=20 r=18 fill="none"></circle></svg></div>';
lichess.assetUrl = (path, opts) => {
    opts = opts || {};
    const baseUrl = opts.sameDomain ? '' : document.body.getAttribute('data-asset-url'), version = document.body.getAttribute('data-asset-version');
    return baseUrl + '/assets' + (opts.noVersion ? '' : '/_' + version) + '/' + path;
};
lichess.loadedCss = {};
lichess.loadCss = function (url) {
    if (lichess.loadedCss[url])
        return;
    lichess.loadedCss[url] = true;
    $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', lichess.assetUrl(url)));
};
lichess.loadCssPath = function (key) {
    lichess.loadCss('css/' + key + '.' + $('body').data('theme') + '.' + ($('body').data('dev') ? 'dev' : 'min') + '.css');
};
lichess.compiledScript = function (name) {
    return 'compiled/lichess.' + name + ($('body').data('dev') ? '' : '.min') + '.js';
};
lichess.loadScript = function (url, opts) {
    return $.ajax({
        dataType: "script",
        cache: true,
        url: lichess.assetUrl(url, opts)
    });
};
lichess.hopscotch = function (f) {
    lichess.loadCss('vendor/hopscotch/dist/css/hopscotch.min.css');
    lichess.loadScript('vendor/hopscotch/dist/js/hopscotch.min.js', { noVersion: true }).done(f);
};
lichess.slider = function () {
    return lichess.loadScript('javascripts/vendor/jquery-ui.slider' + (lichess.hasTouchEvents ? '.touch' : '') + '.min.js');
};
lichess.makeChat = function (data, callback) {
    lichess.raf(function () {
        data.loadCss = lichess.loadCssPath;
        (callback || $.noop)(LichessChat.default(document.querySelector('.mchat'), data));
    });
};
lichess.formAjax = $form => ({
    url: $form.attr('action'),
    method: $form.attr('method') || 'post',
    data: $form.serialize()
});
lichess.numberFormat = (function () {
    var formatter = false;
    return function (n) {
        if (formatter === false)
            formatter = (window.Intl && Intl.NumberFormat) ? new Intl.NumberFormat() : null;
        if (formatter === null)
            return n;
        return formatter.format(n);
    };
})();
lichess.idleTimer = function (delay, onIdle, onWakeUp) {
    var events = ['mousemove', 'touchstart'];
    var listening = false;
    var active = true;
    var lastSeenActive = performance.now();
    var onActivity = function () {
        if (!active) {
            // console.log('Wake up');
            onWakeUp();
        }
        active = true;
        lastSeenActive = performance.now();
        stopListening();
    };
    var startListening = function () {
        if (!listening) {
            events.forEach(function (e) {
                document.addEventListener(e, onActivity);
            });
            listening = true;
        }
    };
    var stopListening = function () {
        if (listening) {
            events.forEach(function (e) {
                document.removeEventListener(e, onActivity);
            });
            listening = false;
        }
    };
    setInterval(function () {
        if (active && performance.now() - lastSeenActive > delay) {
            // console.log('Idle mode');
            onIdle();
            active = false;
        }
        startListening();
    }, 10000);
};
lichess.pubsub = (function () {
    var subs = [];
    return {
        on(name, cb) {
            subs[name] = subs[name] || [];
            subs[name].push(cb);
        },
        off(name, cb) {
            if (!subs[name])
                return;
            for (var i in subs[name]) {
                if (subs[name][i] === cb) {
                    subs[name].splice(i);
                    break;
                }
            }
        },
        emit(name /*, args... */) {
            if (!subs[name])
                return;
            const args = Array.prototype.slice.call(arguments, 1);
            for (let i in subs[name])
                subs[name][i].apply(null, args);
        }
    };
})();
lichess.hasToReload = false;
lichess.redirectInProgress = false;
lichess.redirect = function (obj) {
    var url;
    if (typeof obj == "string")
        url = obj;
    else {
        url = obj.url;
        if (obj.cookie) {
            var domain = document.domain.replace(/^.+(\.[^.]+\.[^.]+)$/, '$1');
            var cookie = [
                encodeURIComponent(obj.cookie.name) + '=' + obj.cookie.value,
                '; max-age=' + obj.cookie.maxAge,
                '; path=/',
                '; domain=' + domain
            ].join('');
            document.cookie = cookie;
        }
    }
    var href = '//' + location.host + '/' + url.replace(/^\//, '');
    lichess.redirectInProgress = href;
    location.href = href;
};
lichess.reload = function () {
    if (lichess.redirectInProgress)
        return;
    lichess.hasToReload = true;
    if (location.hash)
        location.reload();
    else
        location.href = location.href;
};
lichess.escapeHtml = function (str) {
    return /[&<>"']/.test(str) ?
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;') :
        str;
};
$.modal = function (html, cls, onClose) {
    $.modal.close();
    if (!html.clone)
        html = $('<div>' + html + '</div>');
    var $wrap = $('<div id="modal-wrap">')
        .html(html.clone().removeClass('none'))
        .prepend('<span class="close" data-icon="L"></span>');
    var $overlay = $('<div id="modal-overlay">')
        .addClass(cls)
        .data('onClose', onClose)
        .html($wrap);
    $wrap.find('.close').on('click', $.modal.close);
    $overlay.on('click', function () {
        // disgusting hack
        // dragging slider out of a modal closes the modal
        if (!$('.ui-slider-handle.ui-state-focus').length)
            $.modal.close();
    });
    $wrap.on('click', function (e) {
        e.stopPropagation();
    });
    $('body').addClass('overlayed').prepend($overlay);
    return $wrap;
};
$.modal.close = function () {
    $('body').removeClass('overlayed');
    $('#modal-overlay').each(function () {
        ($(this).data('onClose') || $.noop)();
        $(this).remove();
    });
};

},{}],6:[function(require,module,exports){
"use strict";
/** based on https://github.com/hustcc/timeago.js Copyright (c) 2016 hustcc License: MIT **/
lichess.timeago = (function () {
    // divisors for minutes, hours, days, weeks, months, years
    const DIVS = [60,
        60 * 60,
        60 * 60 * 24,
        60 * 60 * 24 * 7,
        60 * 60 * 2 * 365,
        60 * 60 * 24 * 365];
    const LIMITS = [...DIVS];
    LIMITS[2] *= 2; // Show hours up to 2 days.
    // format Date / string / timestamp to Date instance.
    function toDate(input) {
        return input instanceof Date ? input : (new Date(isNaN(input) ? input : parseInt(input)));
    }
    // format the diff second to *** time ago
    function formatDiff(diff) {
        let agoin = 0;
        if (diff < 0) {
            agoin = 1;
            diff = -diff;
        }
        var total_sec = diff;
        let i = 0;
        for (; i < 6 && diff >= LIMITS[i]; i++)
            ;
        if (i > 0)
            diff /= DIVS[i - 1];
        diff = Math.floor(diff);
        i *= 2;
        if (diff > (i === 0 ? 9 : 1))
            i += 1;
        return lichess.timeagoLocale(diff, i, total_sec)[agoin].replace('%s', diff);
    }
    var formatterInst;
    function formatter() {
        return formatterInst = formatterInst || (window.Intl && Intl.DateTimeFormat ?
            new Intl.DateTimeFormat(document.documentElement.lang, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            }).format : function (d) { return d.toLocaleString(); });
    }
    return {
        render: function (nodes) {
            var cl, abs, set, str, diff, now = Date.now();
            nodes.forEach(function (node) {
                cl = node.classList,
                    abs = cl.contains('abs'),
                    set = cl.contains('set');
                node.date = node.date || toDate(node.getAttribute('datetime'));
                if (!set) {
                    str = formatter()(node.date);
                    if (abs)
                        node.textContent = str;
                    else
                        node.setAttribute('title', str);
                    cl.add('set');
                    if (abs || cl.contains('once'))
                        cl.remove('timeago');
                }
                if (!abs) {
                    diff = (now - node.date) / 1000;
                    node.textContent = formatDiff(diff);
                    if (Math.abs(diff) > 9999)
                        cl.remove('timeago'); // ~3h
                }
            });
        },
        // relative
        format: function (date) {
            return formatDiff((Date.now() - toDate(date)) / 1000);
        },
        absolute: function (date) {
            return formatter()(toDate(date));
        }
    };
})();

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbWFpbi5qcyIsInNyYy9zb2NrZXQuanMiLCJzcmMvc3RhbmRhbG9uZXMvdHJhbnMuanMiLCJzcmMvc3RhbmRhbG9uZXMvdXRpbC5qcyIsInNyYy90aW1lYWdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSw4QkFBNEI7QUFDNUIscUJBQW1CO0FBQ25CLCtCQUE2QjtBQUM3QixvQkFBa0I7QUFDbEIsa0JBQWdCOzs7O0FDSmhCLENBQUM7SUFFQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ1YsS0FBSyxFQUFFLEtBQUs7S0FDYixDQUFDLENBQUM7SUFDSCxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxVQUFTLENBQUM7UUFDbEMsaUVBQWlFO1FBQ2pFLCtDQUErQztRQUMvQywrQ0FBK0M7UUFDL0Msc0JBQXNCO1FBQ3RCLGtFQUFrRTtRQUNsRSxJQUFJLE1BQU0sRUFBRSxRQUFRLENBQUM7UUFDckIsT0FBTztZQUNMLElBQUksRUFBRSxVQUFTLENBQUMsRUFBRSxRQUFRO2dCQUN4QixNQUFNLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDMUIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQztvQkFDL0MsT0FBTyxFQUFFLENBQUMsQ0FBQyxhQUFhO29CQUN4QixHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUc7aUJBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxHQUFHLFVBQVMsR0FBRztvQkFDekMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNoQixRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNoQixJQUFJLEdBQUcsRUFBRTt3QkFDUCxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FB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QUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNELFFBQVEsRUFBRSxVQUFTLElBQUk7WUFDckIsT0FBTyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgJy4vc3RhbmRhbG9uZXMvdXRpbCc7XG5pbXBvcnQgJy4vdGltZWFnbyc7XG5pbXBvcnQgJy4vc3RhbmRhbG9uZXMvdHJhbnMnO1xuaW1wb3J0ICcuL3NvY2tldCc7XG5pbXBvcnQgJy4vbWFpbic7XG4iLCIoZnVuY3Rpb24oKSB7XG5cbiAgJC5hamF4U2V0dXAoe1xuICAgIGNhY2hlOiBmYWxzZVxuICB9KTtcbiAgJC5hamF4VHJhbnNwb3J0KCdzY3JpcHQnLCBmdW5jdGlvbihzKSB7XG4gICAgLy8gTW9ua2V5cGF0Y2ggalF1ZXJ5IHRvIGxvYWQgc2NyaXB0cyB3aXRoIG5vbmNlLiBVcHN0cmVhbSBwYXRjaDpcbiAgICAvLyAtIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L3B1bGwvMzc2NlxuICAgIC8vIC0gaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvcHVsbC8zNzgyXG4gICAgLy8gT3JpZ2luYWwgdHJhbnNwb3J0OlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvbWFzdGVyL3NyYy9hamF4L3NjcmlwdC5qc1xuICAgIHZhciBzY3JpcHQsIGNhbGxiYWNrO1xuICAgIHJldHVybiB7XG4gICAgICBzZW5kOiBmdW5jdGlvbihfLCBjb21wbGV0ZSkge1xuICAgICAgICBzY3JpcHQgPSAkKFwiPHNjcmlwdD5cIikucHJvcCh7XG4gICAgICAgICAgbm9uY2U6IGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLW5vbmNlJyksIC8vIEFkZCB0aGUgbm9uY2UhXG4gICAgICAgICAgY2hhcnNldDogcy5zY3JpcHRDaGFyc2V0LFxuICAgICAgICAgIHNyYzogcy51cmxcbiAgICAgICAgfSkub24oXCJsb2FkIGVycm9yXCIsIGNhbGxiYWNrID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgc2NyaXB0LnJlbW92ZSgpO1xuICAgICAgICAgIGNhbGxiYWNrID0gbnVsbDtcbiAgICAgICAgICBpZiAoZXZ0KSB7XG4gICAgICAgICAgICBjb21wbGV0ZShldnQudHlwZSA9PT0gXCJlcnJvclwiID8gNDA0IDogMjAwLCBldnQudHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHRbMF0pO1xuICAgICAgfSxcbiAgICAgIGFib3J0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICAkLnVzZXJMaW5rID0gZnVuY3Rpb24odSkge1xuICAgIHJldHVybiAkLnVzZXJMaW5rTGltaXQodSwgZmFsc2UpO1xuICB9O1xuICAkLnVzZXJMaW5rTGltaXQgPSBmdW5jdGlvbih1LCBsaW1pdCwga2xhc3MpIHtcbiAgICB2YXIgc3BsaXQgPSB1LnNwbGl0KCcgJyk7XG4gICAgdmFyIGlkID0gc3BsaXQubGVuZ3RoID09IDEgPyBzcGxpdFswXSA6IHNwbGl0WzFdO1xuICAgIHJldHVybiB1ID8gJzxhIGNsYXNzPVwidXNlci1saW5rIHVscHQgJyArIChrbGFzcyB8fCAnJykgKyAnXCIgaHJlZj1cIi9ALycgKyBpZCArICdcIj4nICsgKGxpbWl0ID8gdS5zdWJzdHJpbmcoMCwgbGltaXQpIDogdSkgKyAnPC9hPicgOiAnQW5vbnltb3VzJztcbiAgfTtcblxuICBsaWNoZXNzLmFubm91bmNlID0gKCgpID0+IHtcbiAgICBsZXQgdGltZW91dDtcbiAgICBjb25zdCBraWxsID0gKCkgPT4gJCgnI2Fubm91bmNlJykucmVtb3ZlKCk7XG4gICAgY29uc3Qgc2V0ID0gKGQpID0+IHtcbiAgICAgIGlmICghZCkgcmV0dXJuO1xuICAgICAga2lsbCgpO1xuICAgICAgaWYgKHRpbWVvdXQpIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIGlmIChkLm1zZykge1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKFxuICAgICAgICAgICc8ZGl2IGlkPVwiYW5ub3VuY2VcIiBjbGFzcz1cImFubm91bmNlXCI+JyArXG4gICAgICAgICAgZC5tc2cgK1xuICAgICAgICAgICc8dGltZSBjbGFzcz1cInRpbWVhZ29cIiBkYXRldGltZT1cIicgKyBkLmRhdGUgKyAnXCI+PC90aW1lPicgK1xuICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYWN0aW9uc1wiPjxhIGNsYXNzPVwiY2xvc2VcIj5YPC9hPjwvZGl2PicgK1xuICAgICAgICAgICc8L2Rpdj4nXG4gICAgICAgICkuZmluZCgnI2Fubm91bmNlIC5jbG9zZScpLmNsaWNrKGtpbGwpO1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChraWxsLCBuZXcgRGF0ZShkLmRhdGUpIC0gRGF0ZS5ub3coKSk7XG4gICAgICAgIGxpY2hlc3MucHVic3ViLmVtaXQoJ2NvbnRlbnRfbG9hZGVkJyk7XG4gICAgICB9XG4gICAgfTtcbiAgICBzZXQoJCgnYm9keScpLmRhdGEoJ2Fubm91bmNlJykpO1xuICAgIHJldHVybiBzZXQ7XG4gIH0pKCk7XG5cbiAgbGljaGVzcy5zb2NrZXQgPSBudWxsO1xuICBjb25zdCAkZnJpZW5kc0JveCA9ICQoJyNmcmllbmRfYm94Jyk7XG4gICQuZXh0ZW5kKHRydWUsIGxpY2hlc3MuU3Ryb25nU29ja2V0LmRlZmF1bHRzLCB7XG4gICAgZXZlbnRzOiB7XG4gICAgICBmb2xsb3dpbmdfb25saW5lczogZnVuY3Rpb24oXywgZCkge1xuICAgICAgICBkLnVzZXJzID0gZC5kO1xuICAgICAgICAkZnJpZW5kc0JveC5mcmllbmRzKFwic2V0XCIsIGQpO1xuICAgICAgfSxcbiAgICAgIGZvbGxvd2luZ19lbnRlcnM6IGZ1bmN0aW9uKF8sIGQpIHtcbiAgICAgICAgJGZyaWVuZHNCb3guZnJpZW5kcygnZW50ZXJzJywgZCk7XG4gICAgICB9LFxuICAgICAgZm9sbG93aW5nX2xlYXZlczogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAkZnJpZW5kc0JveC5mcmllbmRzKCdsZWF2ZXMnLCBuYW1lKTtcbiAgICAgIH0sXG4gICAgICBmb2xsb3dpbmdfcGxheWluZzogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAkZnJpZW5kc0JveC5mcmllbmRzKCdwbGF5aW5nJywgbmFtZSk7XG4gICAgICB9LFxuICAgICAgZm9sbG93aW5nX3N0b3BwZWRfcGxheWluZzogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAkZnJpZW5kc0JveC5mcmllbmRzKCdzdG9wcGVkX3BsYXlpbmcnLCBuYW1lKTtcbiAgICAgIH0sXG4gICAgICBmb2xsb3dpbmdfam9pbmVkX3N0dWR5OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICRmcmllbmRzQm94LmZyaWVuZHMoJ3N0dWR5X2pvaW4nLCBuYW1lKTtcbiAgICAgIH0sXG4gICAgICBmb2xsb3dpbmdfbGVmdF9zdHVkeTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAkZnJpZW5kc0JveC5mcmllbmRzKCdzdHVkeV9sZWF2ZScsIG5hbWUpO1xuICAgICAgfSxcbiAgICAgIG5ld19ub3RpZmljYXRpb246IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJCgnI25vdGlmeS10b2dnbGUnKS5hdHRyKCdkYXRhLWNvdW50JywgZS51bnJlYWQgfHwgMCk7XG4gICAgICAgIGxpY2hlc3Muc291bmQubmV3UE0oKTtcbiAgICAgIH0sXG4gICAgICByZWRpcmVjdDogZnVuY3Rpb24obykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxpY2hlc3MuaGFzVG9SZWxvYWQgPSB0cnVlO1xuICAgICAgICAgIGxpY2hlc3MucmVkaXJlY3Qobyk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgICB9LFxuICAgICAgdG91cm5hbWVudFJlbWluZGVyOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIGlmICgkKCcjYW5ub3VuY2UnKS5sZW5ndGggfHwgJCgnYm9keScpLmRhdGEoXCJ0b3VybmFtZW50LWlkXCIpID09IGRhdGEuaWQpIHJldHVybjtcbiAgICAgICAgdmFyIHVybCA9ICcvdG91cm5hbWVudC8nICsgZGF0YS5pZDtcbiAgICAgICAgJCgnYm9keScpLmFwcGVuZChcbiAgICAgICAgICAnPGRpdiBpZD1cImFubm91bmNlXCI+JyArXG4gICAgICAgICAgJzxhIGRhdGEtaWNvbj1cImdcIiBjbGFzcz1cInRleHRcIiBocmVmPVwiJyArIHVybCArICdcIj4nICsgZGF0YS5uYW1lICsgJzwvYT4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cImFjdGlvbnNcIj4nICtcbiAgICAgICAgICAnPGEgY2xhc3M9XCJ3aXRoZHJhdyB0ZXh0XCIgaHJlZj1cIicgKyB1cmwgKyAnL3dpdGhkcmF3XCIgZGF0YS1pY29uPVwiWlwiPlBhdXNlPC9hPicgK1xuICAgICAgICAgICc8YSBjbGFzcz1cInRleHRcIiBocmVmPVwiJyArIHVybCArICdcIiBkYXRhLWljb249XCJHXCI+UmVzdW1lPC9hPicgK1xuICAgICAgICAgICc8L2Rpdj48L2Rpdj4nXG4gICAgICAgICkuZmluZCgnI2Fubm91bmNlIC53aXRoZHJhdycpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQucG9zdCgkKHRoaXMpLmF0dHIoXCJocmVmXCIpKTtcbiAgICAgICAgICAkKCcjYW5ub3VuY2UnKS5yZW1vdmUoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGFubm91bmNlOiBsaWNoZXNzLmFubm91bmNlXG4gICAgfSxcbiAgICBwYXJhbXM6IHt9LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIG5hbWU6IFwic2l0ZVwiLFxuICAgICAgbGFnVGFnOiBudWxsLFxuICAgICAgaXNBdXRoOiAhISQoJ2JvZHknKS5kYXRhKCd1c2VyJylcbiAgICB9XG4gIH0pO1xuXG4gIGxpY2hlc3MucmV2ZXJzZSA9IHMgPT4gcy5zcGxpdCgnJykucmV2ZXJzZSgpLmpvaW4oJycpO1xuICBsaWNoZXNzLnJlYWRTZXJ2ZXJGZW4gPSB0ID0+IGF0b2IobGljaGVzcy5yZXZlcnNlKHQpKTtcblxuICBsaWNoZXNzLnVzZXJBdXRvY29tcGxldGUgPSAoJGlucHV0LCBvcHRzKSA9PiB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgbGljaGVzcy5sb2FkQ3NzUGF0aCgnYXV0b2NvbXBsZXRlJyk7XG4gICAgcmV0dXJuIGxpY2hlc3MubG9hZFNjcmlwdCgnamF2YXNjcmlwdHMvdmVuZG9yL3R5cGVhaGVhZC5qcXVlcnkubWluLmpzJykuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgICRpbnB1dC50eXBlYWhlYWQoe1xuICAgICAgICBtaW5MZW5ndGg6IG9wdHMubWluTGVuZ3RoIHx8IDMsXG4gICAgICB9LCB7XG4gICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2UsXG4gICAgICAgIHNvdXJjZTogZnVuY3Rpb24ocXVlcnksIF8sIHJ1bkFzeW5jKSB7XG4gICAgICAgICAgaWYgKHF1ZXJ5LnRyaW0oKS5tYXRjaCgvXlthLXowLTldW1xcdy1dezIsMjl9JC9pKSkgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJy9wbGF5ZXIvYXV0b2NvbXBsZXRlJyxcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICB0ZXJtOiBxdWVyeSxcbiAgICAgICAgICAgICAgZnJpZW5kOiBvcHRzLmZyaWVuZCA/IDEgOiAwLFxuICAgICAgICAgICAgICB0b3VyOiBvcHRzLnRvdXIsXG4gICAgICAgICAgICAgIG9iamVjdDogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3MocmVzKSB7XG4gICAgICAgICAgICAgIHJlcyA9IHJlcy5yZXN1bHQ7XG4gICAgICAgICAgICAgIC8vIGhhY2sgdG8gZml4IHR5cGVhaGVhZCBsaW1pdCBidWdcbiAgICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPT09IDEwKSByZXMucHVzaChudWxsKTtcbiAgICAgICAgICAgICAgcnVuQXN5bmMocmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGltaXQ6IDEwLFxuICAgICAgICBkaXNwbGF5S2V5OiAnbmFtZScsXG4gICAgICAgIHRlbXBsYXRlczoge1xuICAgICAgICAgIGVtcHR5OiAnPGRpdiBjbGFzcz1cImVtcHR5XCI+Tm8gcGxheWVyIGZvdW5kPC9kaXY+JyxcbiAgICAgICAgICBwZW5kaW5nOiBsaWNoZXNzLnNwaW5uZXJIdG1sLFxuICAgICAgICAgIHN1Z2dlc3Rpb246IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgICAgIHZhciB0YWcgPSBvcHRzLnRhZyB8fCAnYSc7XG4gICAgICAgICAgICByZXR1cm4gJzwnICsgdGFnICsgJyBjbGFzcz1cInVscHQgdXNlci1saW5rJyArIChvLm9ubGluZSA/ICcgb25saW5lJyA6ICcnKSArICdcIiAnICsgKHRhZyA9PT0gJ2EnID8gJycgOiAnZGF0YS0nKSArICdocmVmPVwiL0AvJyArIG8ubmFtZSArICdcIj4nICtcbiAgICAgICAgICAgICAgJzxpIGNsYXNzPVwibGluZScgKyAoby5wYXRyb24gPyAnIHBhdHJvbicgOiAnJykgKyAnXCI+PC9pPicgKyAoby50aXRsZSA/ICc8c3BhbiBjbGFzcz1cInRpdGxlXCI+JyArIG8udGl0bGUgKyAnPC9zcGFuPiZuYnNwOycgOiAnJykgICsgby5uYW1lICtcbiAgICAgICAgICAgICAgJzwvJyArIHRhZyArICc+JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pLm9uKCd0eXBlYWhlYWQ6cmVuZGVyJywgKCkgPT4gbGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKSk7XG4gICAgICBpZiAob3B0cy5mb2N1cykgJGlucHV0LmZvY3VzKCk7XG4gICAgICBpZiAob3B0cy5vblNlbGVjdCkgJGlucHV0XG4gICAgICAgIC5vbigndHlwZWFoZWFkOnNlbGVjdCcsIChfLCBzZWwpID0+IG9wdHMub25TZWxlY3Qoc2VsKSlcbiAgICAgICAgLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMCB8fCBlLndoaWNoID09IDEzKSBvcHRzLm9uU2VsZWN0KCQodGhpcykudmFsKCkpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBsaWNoZXNzLnBhcnNlRmVuID0gZnVuY3Rpb24oJGVsZW0pIHtcbiAgICBpZiAoIXdpbmRvdy5DaGVzc2dyb3VuZCkgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBsaWNoZXNzLnBhcnNlRmVuKCRlbGVtKTtcbiAgICB9LCA1MDApOyAvLyBpZiBub3QgbG9hZGVkIHlldFxuICAgIC8vIHNvbWV0aW1lcyAkZWxlbSBpcyBub3QgYSBqUXVlcnksIGNhbiBoYXBwZW4gd2hlbiBjb250ZW50X2xvYWRlZCBpcyB0cmlnZ2VyZWQgd2l0aCByYW5kb20gYXJnc1xuICAgIGlmICghJGVsZW0gfHwgISRlbGVtLmVhY2gpICRlbGVtID0gJCgnLnBhcnNlLWZlbicpO1xuICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLnJlbW92ZUNsYXNzKCdwYXJzZS1mZW4nKTtcbiAgICAgIHZhciBsbSA9ICR0aGlzLmRhdGEoJ2xhc3Rtb3ZlJyk7XG4gICAgICB2YXIgbGFzdE1vdmUgPSBsbSAmJiAobG1bMV0gPT09ICdAJyA/IFtsbS5zbGljZSgyKV0gOiBbbG1bMF0gKyBsbVsxXSwgbG1bMl0gKyBsbVszXV0pO1xuICAgICAgdmFyIGNvbG9yID0gJHRoaXMuZGF0YSgnY29sb3InKSB8fCBsaWNoZXNzLnJlYWRTZXJ2ZXJGZW4oJCh0aGlzKS5kYXRhKCd5JykpO1xuICAgICAgdmFyIGdyb3VuZCA9ICR0aGlzLmRhdGEoJ2NoZXNzZ3JvdW5kJyk7XG4gICAgICB2YXIgcGxheWFibGUgPSAhISR0aGlzLmRhdGEoJ3BsYXlhYmxlJyk7XG4gICAgICB2YXIgcmVzaXphYmxlID0gISEkdGhpcy5kYXRhKCdyZXNpemFibGUnKTtcbiAgICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGNvb3JkaW5hdGVzOiBmYWxzZSxcbiAgICAgICAgdmlld09ubHk6ICFwbGF5YWJsZSxcbiAgICAgICAgcmVzaXphYmxlOiByZXNpemFibGUsXG4gICAgICAgIGZlbjogJHRoaXMuZGF0YSgnZmVuJykgfHwgbGljaGVzcy5yZWFkU2VydmVyRmVuKCR0aGlzLmRhdGEoJ3onKSksXG4gICAgICAgIGxhc3RNb3ZlOiBsYXN0TW92ZSxcbiAgICAgICAgZHJhd2FibGU6IHsgZW5hYmxlZDogZmFsc2UsIHZpc2libGU6IGZhbHNlIH1cbiAgICAgIH07XG4gICAgICBpZiAoY29sb3IpIGNvbmZpZy5vcmllbnRhdGlvbiA9IGNvbG9yO1xuICAgICAgaWYgKGdyb3VuZCkgZ3JvdW5kLnNldChjb25maWcpO1xuICAgICAgZWxzZSAkdGhpcy5kYXRhKCdjaGVzc2dyb3VuZCcsIENoZXNzZ3JvdW5kKHRoaXMsIGNvbmZpZykpO1xuICAgIH0pO1xuICB9O1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxpY2hlc3MuYW5hbHlzZSkgTGljaGVzc0FuYWx5c2UuYm9vdChsaWNoZXNzLmFuYWx5c2UpO1xuICAgIGVsc2UgaWYgKGxpY2hlc3MudXNlcl9hbmFseXNpcykgc3RhcnRVc2VyQW5hbHlzaXMobGljaGVzcy51c2VyX2FuYWx5c2lzKTtcbiAgICBlbHNlIGlmIChsaWNoZXNzLnN0dWR5KSBzdGFydFN0dWR5KGxpY2hlc3Muc3R1ZHkpO1xuICAgIGVsc2UgaWYgKGxpY2hlc3MucHJhY3RpY2UpIHN0YXJ0UHJhY3RpY2UobGljaGVzcy5wcmFjdGljZSk7XG4gICAgZWxzZSBpZiAobGljaGVzcy5yZWxheSkgc3RhcnRSZWxheShsaWNoZXNzLnJlbGF5KTtcbiAgICBlbHNlIGlmIChsaWNoZXNzLnB1enpsZSkgc3RhcnRQdXp6bGUobGljaGVzcy5wdXp6bGUpO1xuICAgIGVsc2UgaWYgKGxpY2hlc3MudG91cm5hbWVudCkgc3RhcnRUb3VybmFtZW50KGxpY2hlc3MudG91cm5hbWVudCk7XG4gICAgZWxzZSBpZiAobGljaGVzcy5zaW11bCkgc3RhcnRTaW11bChsaWNoZXNzLnNpbXVsKTtcblxuICAgIC8vIGRlbGF5IHNvIHJvdW5kIHN0YXJ0cyBmaXJzdCAoanVzdCBmb3IgcGVyY2VpdmVkIHBlcmYpXG4gICAgbGljaGVzcy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGZ1bmN0aW9uKCkge1xuXG4gICAgICAkKCcjZnJpZW5kX2JveCcpLmZyaWVuZHMoKTtcblxuICAgICAgJCgnI21haW4td3JhcCcpXG4gICAgICAgIC5vbignY2xpY2snLCAnLmF1dG9zZWxlY3QnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKHRoaXMpLnNlbGVjdCgpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrJywgJ2J1dHRvbi5jb3B5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCgnIycgKyAkKHRoaXMpLmRhdGEoJ3JlbCcpKS5zZWxlY3QoKTtcbiAgICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgICAgICAgICQodGhpcykuYXR0cignZGF0YS1pY29uJywgJ0UnKTtcbiAgICAgICAgfSk7XG4gICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgJ2EucmVsYXRpb24tYnV0dG9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkYSA9ICQodGhpcykuYWRkQ2xhc3MoJ3Byb2Nlc3NpbmcnKS5jc3MoJ29wYWNpdHknLCAwLjMpO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgIHVybDogJGEuYXR0cignaHJlZicpLFxuICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICAgICAgICBpZiAoaHRtbC5pbmNsdWRlcygncmVsYXRpb24tYWN0aW9ucycpKSAkYS5wYXJlbnQoKS5yZXBsYWNlV2l0aChodG1sKTtcbiAgICAgICAgICAgIGVsc2UgJGEucmVwbGFjZVdpdGgoaHRtbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgICQoJy5tc2VsZWN0IC5idXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRwID0gJCh0aGlzKS5wYXJlbnQoKTtcbiAgICAgICAgJHAudG9nZ2xlQ2xhc3MoJ3Nob3duJyk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoJC5jb250YWlucygkcFswXSwgZS50YXJnZXQpKSByZXR1cm47XG4gICAgICAgICAgICAkcC5yZW1vdmVDbGFzcygnc2hvd24nKTtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5vZmYoJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICAkKCdodG1sJykub24oJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH0pO1xuXG4gICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGxpY2hlc3MucG93ZXJ0aXAubW91c2VvdmVyKTtcblxuICAgICAgZnVuY3Rpb24gcmVuZGVyVGltZWFnbygpIHtcbiAgICAgICAgbGljaGVzcy5yYWYoKCkgPT5cbiAgICAgICAgICBsaWNoZXNzLnRpbWVhZ28ucmVuZGVyKFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGltZWFnbycpLCAwLCA5OSkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBzZXRUaW1lYWdvKGludGVydmFsKSB7XG4gICAgICAgIHJlbmRlclRpbWVhZ28oKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRUaW1lYWdvKGludGVydmFsICogMS4xKSwgaW50ZXJ2YWwpO1xuICAgICAgfVxuICAgICAgc2V0VGltZWFnbygxMjAwKTtcbiAgICAgIGxpY2hlc3MucHVic3ViLm9uKCdjb250ZW50X2xvYWRlZCcsIHJlbmRlclRpbWVhZ28pO1xuXG4gICAgICBpZiAoIXdpbmRvdy5jdXN0b21XUykgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGxpY2hlc3Muc29ja2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgbGljaGVzcy5zb2NrZXQgPSBsaWNoZXNzLlN0cm9uZ1NvY2tldChcIi9zb2NrZXQvdjRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9LCAzMDApO1xuXG4gICAgICBjb25zdCBpbml0aWF0aW5nSHRtbCA9ICc8ZGl2IGNsYXNzPVwiaW5pdGlhdGluZ1wiPicgKyBsaWNoZXNzLnNwaW5uZXJIdG1sICsgJzwvZGl2Pic7XG5cbiAgICAgIGxpY2hlc3MuY2hhbGxlbmdlQXBwID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW5zdGFuY2UsIGJvb3RlZDtcbiAgICAgICAgdmFyICR0b2dnbGUgPSAkKCcjY2hhbGxlbmdlLXRvZ2dsZScpO1xuICAgICAgICAkdG9nZ2xlLm9uZSgnbW91c2VvdmVyIGNsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9hZCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGxvYWQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgaWYgKGJvb3RlZCkgcmV0dXJuO1xuICAgICAgICAgIGJvb3RlZCA9IHRydWU7XG4gICAgICAgICAgdmFyICRlbCA9ICQoJyNjaGFsbGVuZ2UtYXBwJykuaHRtbChsaWNoZXNzLmluaXRpYXRpbmdIdG1sKTtcbiAgICAgICAgICBsaWNoZXNzLmxvYWRDc3NQYXRoKCdjaGFsbGVuZ2UnKTtcbiAgICAgICAgICBsaWNoZXNzLmxvYWRTY3JpcHQobGljaGVzcy5jb21waWxlZFNjcmlwdCgnY2hhbGxlbmdlJykpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IExpY2hlc3NDaGFsbGVuZ2UuZGVmYXVsdCgkZWxbMF0sIHtcbiAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKCcjY2hhbGxlbmdlLWFwcCcpLmlzKCc6dmlzaWJsZScpKSAkdG9nZ2xlLmNsaWNrKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNldENvdW50OiBmdW5jdGlvbihuYikge1xuICAgICAgICAgICAgICAgICR0b2dnbGUuZmluZCgnc3BhbicpLmF0dHIoJ2RhdGEtY291bnQnLCBuYik7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHB1bHNlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkdG9nZ2xlLmFkZENsYXNzKCdwdWxzZScpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UpIGxvYWQoZGF0YSk7XG4gICAgICAgICAgICBlbHNlIGluc3RhbmNlLnVwZGF0ZShkYXRhKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHRvZ2dsZS5jbGljaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKCk7XG5cbiAgICAgIGxpY2hlc3Mubm90aWZ5QXBwID0gKCgpID0+IHtcbiAgICAgICAgbGV0IGluc3RhbmNlLCBib290ZWQ7XG4gICAgICAgIGNvbnN0ICR0b2dnbGUgPSAkKCcjbm90aWZ5LXRvZ2dsZScpLFxuICAgICAgICAgIGlzVmlzaWJsZSA9ICgpID0+ICQoJyNub3RpZnktYXBwJykuaXMoJzp2aXNpYmxlJyksXG4gICAgICAgICAgcGVybWlzc2lvbkNoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAkdG9nZ2xlLmZpbmQoJ3NwYW4nKS5hdHRyKCdkYXRhLWljb24nLCAnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cgJiYgTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT0gJ2dyYW50ZWQnID8gJ1xcdWUwMGYnIDogJ1xceGJmJyk7XG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UpIGluc3RhbmNlLnJlZHJhdygpO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKCdwZXJtaXNzaW9ucycgaW4gbmF2aWdhdG9yKSBuYXZpZ2F0b3IucGVybWlzc2lvbnMucXVlcnkoe25hbWU6ICdub3RpZmljYXRpb25zJ30pLnRoZW4ocGVybSA9PiB7XG4gICAgICAgICAgcGVybS5vbmNoYW5nZSA9IHBlcm1pc3Npb25DaGFuZ2VkO1xuICAgICAgICB9KTtcbiAgICAgICAgcGVybWlzc2lvbkNoYW5nZWQoKTtcblxuICAgICAgICBjb25zdCBsb2FkID0gZnVuY3Rpb24oZGF0YSwgaW5jb21pbmcpIHtcbiAgICAgICAgICBpZiAoYm9vdGVkKSByZXR1cm47XG4gICAgICAgICAgYm9vdGVkID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgJGVsID0gJCgnI25vdGlmeS1hcHAnKS5odG1sKGluaXRpYXRpbmdIdG1sKTtcbiAgICAgICAgICBsaWNoZXNzLmxvYWRDc3NQYXRoKCdub3RpZnknKTtcbiAgICAgICAgICBsaWNoZXNzLmxvYWRTY3JpcHQobGljaGVzcy5jb21waWxlZFNjcmlwdCgnbm90aWZ5JykpLmRvbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbnN0YW5jZSA9IExpY2hlc3NOb3RpZnkuZGVmYXVsdCgkZWwuZW1wdHkoKVswXSwge1xuICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICBpbmNvbWluZzogaW5jb21pbmcsXG4gICAgICAgICAgICAgIGlzVmlzaWJsZTogaXNWaXNpYmxlLFxuICAgICAgICAgICAgICBzZXRDb3VudChuYikge1xuICAgICAgICAgICAgICAgICR0b2dnbGUuZmluZCgnc3BhbicpLmF0dHIoJ2RhdGEtY291bnQnLCBuYik7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNob3coKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1Zpc2libGUoKSkgJHRvZ2dsZS5jbGljaygpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzZXROb3RpZmllZCgpIHtcbiAgICAgICAgICAgICAgICBsaWNoZXNzLnNvY2tldC5zZW5kKCdub3RpZmllZCcpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwdWxzZSgpIHtcbiAgICAgICAgICAgICAgICAkdG9nZ2xlLmFkZENsYXNzKCdwdWxzZScpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAkdG9nZ2xlLm9uZSgnbW91c2VvdmVyIGNsaWNrJywgKCkgPT4gbG9hZCgpKS5jbGljaygoKSA9PiB7XG4gICAgICAgICAgaWYgKCdOb3RpZmljYXRpb24nIGluIHdpbmRvdykgTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKHAgPT4gcGVybWlzc2lvbkNoYW5nZWQoKSk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaXNWaXNpYmxlKCkpIGluc3RhbmNlLnNldFZpc2libGUoKTtcbiAgICAgICAgICB9LCAyMDApO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSwgaW5jb21pbmcpIHtcbiAgICAgICAgICAgIGlmICghaW5zdGFuY2UpIGxvYWQoZGF0YSwgaW5jb21pbmcpO1xuICAgICAgICAgICAgZWxzZSBpbnN0YW5jZS51cGRhdGUoZGF0YSwgaW5jb21pbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKCk7XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiBsaWNoZXNzLmRpc3BhdGNoRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2NoZXNzZ3JvdW5kLnJlc2l6ZScpKTtcblxuICAgICAgLy8gZGFzaGVyXG4gICAgICB7XG4gICAgICAgIGxldCBib290ZWQ7XG4gICAgICAgICQoJyN0b3AgLmRhc2hlciAudG9nZ2xlJykub25lKCdtb3VzZW92ZXIgY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoYm9vdGVkKSByZXR1cm47XG4gICAgICAgICAgYm9vdGVkID0gdHJ1ZTtcbiAgICAgICAgICBjb25zdCAkZWwgPSAkKCcjZGFzaGVyX2FwcCcpLmh0bWwoaW5pdGlhdGluZ0h0bWwpLFxuICAgICAgICAgICAgcGxheWluZyA9ICQoJ2JvZHknKS5oYXNDbGFzcygncGxheWluZycpO1xuICAgICAgICAgIGxpY2hlc3MubG9hZENzc1BhdGgoJ2Rhc2hlcicpO1xuICAgICAgICAgIGxpY2hlc3MubG9hZFNjcmlwdChsaWNoZXNzLmNvbXBpbGVkU2NyaXB0KCdkYXNoZXInKSkuZG9uZSgoKSA9PlxuICAgICAgICAgICAgTGljaGVzc0Rhc2hlci5kZWZhdWx0KCRlbC5lbXB0eSgpWzBdLCB7IHBsYXlpbmcgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gY2xpXG4gICAgICB7XG4gICAgICAgIGNvbnN0ICR3cmFwID0gJCgnI2NsaW5wdXQnKTtcbiAgICAgICAgaWYgKCEkd3JhcC5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgbGV0IGJvb3RlZDtcbiAgICAgICAgY29uc3QgJGlucHV0ID0gJHdyYXAuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgY29uc3QgYm9vdCA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoYm9vdGVkKSByZXR1cm4gJC5EZWZlcnJlZCgpLnJlc29sdmUoKTtcbiAgICAgICAgICBib290ZWQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBsaWNoZXNzLmxvYWRTY3JpcHQobGljaGVzcy5jb21waWxlZFNjcmlwdCgnY2xpJykpLmRvbmUoKCkgPT5cbiAgICAgICAgICAgIExpY2hlc3NDbGkuYXBwKCR3cmFwLCB0b2dnbGUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdG9nZ2xlID0gdHh0ID0+IHtcbiAgICAgICAgICBib290KCkuZG9uZSgoKSA9PiAkaW5wdXQudmFsKHR4dCB8fCAnJykpO1xuICAgICAgICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnY2xpbnB1dCcpO1xuICAgICAgICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ2NsaW5wdXQnKSkgJGlucHV0LmZvY3VzKCk7XG4gICAgICAgIH07XG4gICAgICAgICR3cmFwLmZpbmQoJ2EnKS5vbignbW91c2VvdmVyIGNsaWNrJywgZSA9PiAoZS50eXBlID09PSAnbW91c2VvdmVyJyA/IGJvb3QgOiB0b2dnbGUpKCkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnLycsICgpID0+IHtcbiAgICAgICAgICBsaWNoZXNzLnJhZigoKSA9PiB0b2dnbGUoJy8nKSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3MnLCAoKSA9PiBsaWNoZXNzLnJhZigoKSA9PiB0b2dnbGUoKSkpO1xuICAgICAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdibGluZC1tb2RlJykpICRpbnB1dC5vbmUoJ2ZvY3VzJywgKCkgPT4gdG9nZ2xlKCkpO1xuICAgICAgfVxuXG4gICAgICAkKCcudXNlci1hdXRvY29tcGxldGUnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBvcHRzID0ge1xuICAgICAgICAgIGZvY3VzOiAxLFxuICAgICAgICAgIGZyaWVuZDogJCh0aGlzKS5kYXRhKCdmcmllbmQnKSxcbiAgICAgICAgICB0YWc6ICQodGhpcykuZGF0YSgndGFnJylcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCQodGhpcykuYXR0cignYXV0b2ZvY3VzJykpIGxpY2hlc3MudXNlckF1dG9jb21wbGV0ZSgkKHRoaXMpLCBvcHRzKTtcbiAgICAgICAgZWxzZSAkKHRoaXMpLm9uZSgnZm9jdXMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsaWNoZXNzLnVzZXJBdXRvY29tcGxldGUoJCh0aGlzKSwgb3B0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgICQoJyN0b3BuYXYtdG9nZ2xlJykub24oJ2NoYW5nZScsIGUgPT4ge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoJ21hc2tlZCcsIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgfSk7XG5cbiAgICAgIGxpY2hlc3MubG9hZEluZmluaXRlU2Nyb2xsID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgJChlbCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoISQoJy5wYWdlciBhJywgdGhpcykubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgdmFyICRzY3JvbGxlciA9ICQodGhpcykuaW5maW5pdGVzY3JvbGwoe1xuICAgICAgICAgICAgbmF2U2VsZWN0b3I6IFwiLnBhZ2VyXCIsXG4gICAgICAgICAgICBuZXh0U2VsZWN0b3I6IFwiLnBhZ2VyIGFcIixcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogXCIuaW5maW5pdGVzY3JvbGwgLnBhZ2luYXRlZFwiLFxuICAgICAgICAgICAgZXJyb3JDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQoXCIjaW5mc2NyLWxvYWRpbmdcIikucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9hZGluZzoge1xuICAgICAgICAgICAgICBtc2c6ICQoJzxkaXYgaWQ9XCJpbmZzY3ItbG9hZGluZ1wiPicpLmh0bWwobGljaGVzcy5zcGlubmVySHRtbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoXCIjaW5mc2NyLWxvYWRpbmdcIikucmVtb3ZlKCk7XG4gICAgICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdjb250ZW50X2xvYWRlZCcpO1xuICAgICAgICAgICAgdmFyIGlkcyA9IFtdO1xuICAgICAgICAgICAgJChlbCkuZmluZCgnLnBhZ2luYXRlZFtkYXRhLWRlZHVwXScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBpZCA9ICQodGhpcykuZGF0YSgnZGVkdXAnKTtcbiAgICAgICAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlkcy5pbmNsdWRlcyhpZCkpICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZHMucHVzaChpZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLmZpbmQoJ2Rpdi5wYWdlcicpLmhpZGUoKS5lbmQoKTtcbiAgICAgICAgICAkc2Nyb2xsZXIucGFyZW50KCkuYXBwZW5kKCQoJzxidXR0b24gY2xhc3M9XCJpbmYtbW9yZSBidXR0b24gYnV0dG9uLWVtcHR5XCI+JmhlbGxpcDs8L2J1dHRvbj4nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY3JvbGxlci5pbmZpbml0ZXNjcm9sbCgncmV0cmlldmUnKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgbGljaGVzcy5sb2FkSW5maW5pdGVTY3JvbGwoJy5pbmZpbml0ZXNjcm9sbCcpO1xuXG4gICAgICAkKCcjdG9wJykub24oJ2NsaWNrJywgJ2EudG9nZ2xlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkcCA9ICQodGhpcykucGFyZW50KCk7XG4gICAgICAgICRwLnRvZ2dsZUNsYXNzKCdzaG93bicpO1xuICAgICAgICAkcC5zaWJsaW5ncygnLnNob3duJykucmVtb3ZlQ2xhc3MoJ3Nob3duJyk7XG4gICAgICAgIGxpY2hlc3MucHVic3ViLmVtaXQoJ3RvcC50b2dnbGUuJyArICQodGhpcykuYXR0cignaWQnKSk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAoJC5jb250YWlucygkcFswXSwgZS50YXJnZXQpKSByZXR1cm47XG4gICAgICAgICAgICAkcC5yZW1vdmVDbGFzcygnc2hvd24nKTtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5vZmYoJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgICAgICAgfTtcbiAgICAgICAgICAkKCdodG1sJykub24oJ2NsaWNrJywgaGFuZGxlcik7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgICQoJ2EuZGVsZXRlLCBpbnB1dC5kZWxldGUnKS5jbGljaygoKSA9PiBjb25maXJtKCdEZWxldGU/JykpO1xuICAgICAgJCgnaW5wdXQuY29uZmlybSwgYnV0dG9uLmNvbmZpcm0nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNvbmZpcm0oJCh0aGlzKS5hdHRyKCd0aXRsZScpIHx8ICdDb25maXJtIHRoaXMgYWN0aW9uPycpO1xuICAgICAgfSk7XG5cbiAgICAgICQoJyNtYWluLXdyYXAnKS5vbignY2xpY2snLCAnYS5ib29rbWFyaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdCA9ICQodGhpcykudG9nZ2xlQ2xhc3MoXCJib29rbWFya2VkXCIpO1xuICAgICAgICAkLnBvc3QodC5hdHRyKFwiaHJlZlwiKSk7XG4gICAgICAgIHZhciBjb3VudCA9IChwYXJzZUludCh0LnRleHQoKSwgMTApIHx8IDApICsgKHQuaGFzQ2xhc3MoXCJib29rbWFya2VkXCIpID8gMSA6IC0xKTtcbiAgICAgICAgdC5maW5kKCdzcGFuJykuaHRtbChjb3VudCA+IDAgPyBjb3VudCA6IFwiXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgLy8gc3RpbGwgYmluZCBlc2MgZXZlbiBpbiBmb3JtIGZpZWxkc1xuICAgICAgTW91c2V0cmFwLnByb3RvdHlwZS5zdG9wQ2FsbGJhY2sgPSBmdW5jdGlvbihlLCBlbCwgY29tYm8pIHtcbiAgICAgICAgcmV0dXJuIGNvbWJvICE9PSAnZXNjJyAmJiAoZWwudGFnTmFtZSA9PT0gJ0lOUFVUJyB8fCBlbC50YWdOYW1lID09PSAnU0VMRUNUJyB8fCBlbC50YWdOYW1lID09PSAnVEVYVEFSRUEnKTtcbiAgICAgIH07XG4gICAgICBNb3VzZXRyYXAuYmluZCgnZXNjJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkb2MgPSAkKCcjbW9kYWwtd3JhcCAuY2xvc2UnKTtcbiAgICAgICAgaWYgKCRvYy5sZW5ndGgpICRvYy50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgJGlucHV0ID0gJCgnOmZvY3VzJyk7XG4gICAgICAgICAgaWYgKCRpbnB1dC5sZW5ndGgpICRpbnB1dC50cmlnZ2VyKCdibHVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghbGljaGVzcy5zdG9yYWdlLmdldCgnZ3JpZCcpKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWdyaWQnKSlcbiAgICAgICAgICBsaWNoZXNzLnN0b3JhZ2Uuc2V0KCdncmlkJywgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkLmdldChsaWNoZXNzLmFzc2V0VXJsKCdvb3BzL2Jyb3dzZXIuaHRtbCcpLCBodG1sID0+ICQoJ2JvZHknKS5wcmVwZW5kKGh0bWwpKVxuICAgICAgfSwgMzAwMCk7XG5cbiAgICAgIC8qIEEgZGlzZ3VzdGluZyBoYWNrIGZvciBhIGRpc2d1c3RpbmcgYnJvd3NlclxuICAgICAgICogRWRnZSByYW5kb21seSBmYWlscyB0byByYXN0ZXJpemUgU1ZHIG9uIHBhZ2UgbG9hZFxuICAgICAgICogQSBkaWZmZXJlbnQgU1ZHIG11c3QgYmUgbG9hZGVkIHNvIGEgbmV3IGltYWdlIGNhbiBiZSByYXN0ZXJpemVkICovXG4gICAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdFZGdlLycpID4gLTEpIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHNwcml0ZSA9ICQoJyNwaWVjZS1zcHJpdGUnKTtcbiAgICAgICAgc3ByaXRlLmF0dHIoJ2hyZWYnLCBzcHJpdGUuYXR0cignaHJlZicpLnJlcGxhY2UoJy5jc3MnLCAnLmV4dGVybmFsLmNzcycpKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICBpZiAod2luZG93LkZpbmdlcnByaW50Mikgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHQgPSBEYXRlLm5vdygpXG4gICAgICAgIG5ldyBGaW5nZXJwcmludDIoe1xuICAgICAgICAgIGV4Y2x1ZGVKc0ZvbnRzOiB0cnVlXG4gICAgICAgIH0pLmdldChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2YXIgJGkgPSAkKCcjc2lnbnVwLWZwLWlucHV0Jyk7XG4gICAgICAgICAgaWYgKCRpLmxlbmd0aCkgJGkudmFsKHJlcyk7XG4gICAgICAgICAgZWxzZSAkLnBvc3QoJy9hdXRoL3NldC1mcC8nICsgcmVzICsgJy8nICsgKERhdGUubm93KCkgLSB0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgbGljaGVzcy5zb3VuZCA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBpID0ge307XG4gICAgdmFyIHNvdW5kU2V0ID0gJCgnYm9keScpLmRhdGEoJ3NvdW5kLXNldCcpO1xuXG4gICAgdmFyIHNwZWVjaFN0b3JhZ2UgPSBsaWNoZXNzLnN0b3JhZ2UubWFrZUJvb2xlYW4oJ3NwZWVjaC5lbmFibGVkJyk7XG4gICAgYXBpLnNwZWVjaCA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICh0eXBlb2YgdiA9PSAndW5kZWZpbmVkJykgcmV0dXJuIHNwZWVjaFN0b3JhZ2UuZ2V0KCk7XG4gICAgICBzcGVlY2hTdG9yYWdlLnNldCh2KTtcbiAgICAgIGNvbGxlY3Rpb24uY2xlYXIoKTtcbiAgICB9O1xuICAgIGFwaS52b2x1bWVTdG9yYWdlID0gbGljaGVzcy5zdG9yYWdlLm1ha2UoJ3NvdW5kLXZvbHVtZScpO1xuICAgIGFwaS5kZWZhdWx0Vm9sdW1lID0gMC43O1xuXG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgICB2YXIgbG9hZGVkID0ge307XG4gICAgICB2YXIgZiA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoIWxvYWRlZFtrZXldKSBsb2FkZWRba2V5XSA9IGZhY3Rvcnkoa2V5KTtcbiAgICAgICAgcmV0dXJuIGxvYWRlZFtrZXldO1xuICAgICAgfTtcbiAgICAgIGYuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9hZGVkID0ge307XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcblxuICAgIHZhciBuYW1lcyA9IHtcbiAgICAgIGdlbmVyaWNOb3RpZnk6ICdHZW5lcmljTm90aWZ5JyxcbiAgICAgIG1vdmU6ICdNb3ZlJyxcbiAgICAgIGNhcHR1cmU6ICdDYXB0dXJlJyxcbiAgICAgIGV4cGxvZGU6ICdFeHBsb3Npb24nLFxuICAgICAgbG93dGltZTogJ0xvd1RpbWUnLFxuICAgICAgdmljdG9yeTogJ1ZpY3RvcnknLFxuICAgICAgZGVmZWF0OiAnRGVmZWF0JyxcbiAgICAgIGRyYXc6ICdEcmF3JyxcbiAgICAgIHRvdXJuYW1lbnQxc3Q6ICdUb3VybmFtZW50MXN0JyxcbiAgICAgIHRvdXJuYW1lbnQybmQ6ICdUb3VybmFtZW50Mm5kJyxcbiAgICAgIHRvdXJuYW1lbnQzcmQ6ICdUb3VybmFtZW50M3JkJyxcbiAgICAgIHRvdXJuYW1lbnRPdGhlcjogJ1RvdXJuYW1lbnRPdGhlcicsXG4gICAgICBiZXJzZXJrOiAnQmVyc2VyaycsXG4gICAgICBjaGVjazogJ0NoZWNrJyxcbiAgICAgIG5ld0NoYWxsZW5nZTogJ05ld0NoYWxsZW5nZScsXG4gICAgICBuZXdQTTogJ05ld1BNJyxcbiAgICAgIGNvbmZpcm1hdGlvbjogJ0NvbmZpcm1hdGlvbicsXG4gICAgICBlcnJvcjogJ0Vycm9yJ1xuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gMTA7IGkrKykgbmFtZXNbJ2NvdW50RG93bicgKyBpXSA9ICdDb3VudERvd24nICsgaTtcblxuICAgIHZhciB2b2x1bWVzID0ge1xuICAgICAgbG93dGltZTogMC41LFxuICAgICAgZXhwbG9kZTogMC4zNSxcbiAgICAgIGNvbmZpcm1hdGlvbjogMC41XG4gICAgfTtcbiAgICB2YXIgY29sbGVjdGlvbiA9IG5ldyBtZW1vaXplKGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBzZXQgPSBzb3VuZFNldDtcbiAgICAgIGlmIChzZXQgPT09ICdtdXNpYycgfHwgc3BlZWNoU3RvcmFnZS5nZXQoKSkge1xuICAgICAgICBpZiAoWydtb3ZlJywgJ2NhcHR1cmUnLCAnY2hlY2snXS5pbmNsdWRlcyhrKSkgcmV0dXJuIHtcbiAgICAgICAgICBwbGF5OiAkLm5vb3BcbiAgICAgICAgfTtcbiAgICAgICAgc2V0ID0gJ3N0YW5kYXJkJztcbiAgICAgIH1cbiAgICAgIHZhciBiYXNlVXJsID0gbGljaGVzcy5hc3NldFVybCgnc291bmQnLCB7bm9WZXJzaW9uOiB0cnVlfSk7XG4gICAgICByZXR1cm4gbmV3IEhvd2woe1xuICAgICAgICBzcmM6IFsnb2dnJywgJ21wMyddLm1hcChmdW5jdGlvbihleHQpIHtcbiAgICAgICAgICByZXR1cm4gW2Jhc2VVcmwsIHNldCwgbmFtZXNba10gKyAnLicgKyBleHRdLmpvaW4oJy8nKTtcbiAgICAgICAgfSksXG4gICAgICAgIHZvbHVtZTogdm9sdW1lc1trXSB8fCAxXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB2YXIgZW5hYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHNvdW5kU2V0ICE9PSAnc2lsZW50JztcbiAgICB9O1xuICAgIE9iamVjdC5rZXlzKG5hbWVzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGFwaVtuYW1lXSA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgaWYgKCFlbmFibGVkKCkpIHJldHVybjtcbiAgICAgICAgaWYgKCF0ZXh0IHx8ICFhcGkuc2F5KHRleHQpKSB7XG4gICAgICAgICAgSG93bGVyLnZvbHVtZShhcGkuZ2V0Vm9sdW1lKCkpO1xuICAgICAgICAgIHZhciBzb3VuZCA9IGNvbGxlY3Rpb24obmFtZSk7XG4gICAgICAgICAgaWYgKEhvd2xlci5jdHggJiYgSG93bGVyLmN0eC5zdGF0ZSA9PSBcInN1c3BlbmRlZFwiKSB7XG4gICAgICAgICAgICBIb3dsZXIuY3R4LnJlc3VtZSgpLnRoZW4oKCkgPT4gc291bmQucGxheSgpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc291bmQucGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGFwaS5zYXkgPSBmdW5jdGlvbih0ZXh0LCBjdXQsIGZvcmNlKSB7XG4gICAgICBpZiAoIXNwZWVjaFN0b3JhZ2UuZ2V0KCkgJiYgIWZvcmNlKSByZXR1cm4gZmFsc2U7XG4gICAgICB2YXIgbXNnID0gdGV4dC50ZXh0ID8gdGV4dCA6IG5ldyBTcGVlY2hTeW50aGVzaXNVdHRlcmFuY2UodGV4dCk7XG4gICAgICBtc2cudm9sdW1lID0gYXBpLmdldFZvbHVtZSgpO1xuICAgICAgbXNnLmxhbmcgPSAnZW4tVVMnO1xuICAgICAgaWYgKGN1dCkgc3BlZWNoU3ludGhlc2lzLmNhbmNlbCgpO1xuICAgICAgc3BlZWNoU3ludGhlc2lzLnNwZWFrKG1zZyk7XG4gICAgICBjb25zb2xlLmxvZyhgJWMke21zZy50ZXh0fWAsICdjb2xvcjogYmx1ZScpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBhcGkubG9hZCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGlmIChlbmFibGVkKCkgJiYgbmFtZSBpbiBuYW1lcykgY29sbGVjdGlvbihuYW1lKTtcbiAgICB9O1xuICAgIGFwaS5zZXRWb2x1bWUgPSBmdW5jdGlvbih2KSB7XG4gICAgICBhcGkudm9sdW1lU3RvcmFnZS5zZXQodik7XG4gICAgICBIb3dsZXIudm9sdW1lKHYpO1xuICAgIH07XG4gICAgYXBpLmdldFZvbHVtZSA9ICgpID0+IHtcbiAgICAgIC8vIGdhcmJhZ2UgaGFzIGJlZW4gc3RvcmVkIHN0b3JlZCBieSBhY2NpZGVudCAoZTk3MmQ1NjEyZClcbiAgICAgIGNvbnN0IHYgPSBwYXJzZUZsb2F0KGFwaS52b2x1bWVTdG9yYWdlLmdldCgpKTtcbiAgICAgIHJldHVybiB2ID49IDAgPyB2IDogYXBpLmRlZmF1bHRWb2x1bWU7XG4gICAgfVxuXG4gICAgdmFyIHB1Ymxpc2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIGxpY2hlc3MucHVic3ViLmVtaXQoJ3NvdW5kX3NldCcsIHNvdW5kU2V0KTtcbiAgICB9O1xuICAgIHNldFRpbWVvdXQocHVibGlzaCwgNTAwKTtcblxuICAgIGFwaS5jaGFuZ2VTZXQgPSBmdW5jdGlvbihzKSB7XG4gICAgICBzb3VuZFNldCA9IHM7XG4gICAgICBjb2xsZWN0aW9uLmNsZWFyKCk7XG4gICAgICBwdWJsaXNoKCk7XG4gICAgfTtcblxuICAgIGFwaS53YXJtdXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChlbmFibGVkKCkpIHtcbiAgICAgICAgLy8gU2VlIGdvbGRmaXJlL2hvd2xlci5qcyM3MTVcbiAgICAgICAgSG93bGVyLl9hdXRvUmVzdW1lKCk7ICAgLy8gVGhpcyByZXN1bWVzIHNvdW5kIGlmIHN1c3BlbmRlZC5cbiAgICAgICAgSG93bGVyLl9hdXRvU3VzcGVuZCgpOyAgLy8gVGhpcyBzdGFydHMgdGhlIDMwcyB0aW1lciB0byBzdXNwZW5kLlxuICAgICAgfVxuICAgIH07XG5cbiAgICBhcGkuc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc291bmRTZXQ7XG4gICAgfTtcbiAgICByZXR1cm4gYXBpO1xuICB9KSgpO1xuXG4gIGxpY2hlc3Mud2lkZ2V0KCd3YXRjaGVycycsIHtcbiAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMubGlzdCA9IHRoaXMuZWxlbWVudC5maW5kKFwiLmxpc3RcIik7XG4gICAgICB0aGlzLm51bWJlciA9IHRoaXMuZWxlbWVudC5maW5kKFwiLm51bWJlclwiKTtcbiAgICAgIGxpY2hlc3MucHVic3ViLm9uKCdzb2NrZXQuaW4uY3Jvd2QnLCBkYXRhID0+IHRoaXMuc2V0KGRhdGEud2F0Y2hlcnMgfHwgZGF0YSkpO1xuICAgICAgbGljaGVzcy53YXRjaGVyc0RhdGEgJiYgdGhpcy5zZXQobGljaGVzcy53YXRjaGVyc0RhdGEpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBsaWNoZXNzLndhdGNoZXJzRGF0YSA9IGRhdGE7XG4gICAgICBpZiAoIWRhdGEgfHwgIWRhdGEubmIpIHJldHVybiB0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoJ25vbmUnKTtcbiAgICAgIGlmICh0aGlzLm51bWJlci5sZW5ndGgpIHRoaXMubnVtYmVyLnRleHQoZGF0YS5uYik7XG4gICAgICBpZiAoZGF0YS51c2Vycykge1xuICAgICAgICB2YXIgdGFncyA9IGRhdGEudXNlcnMubWFwKCQudXNlckxpbmspO1xuICAgICAgICBpZiAoZGF0YS5hbm9ucyA9PT0gMSkgdGFncy5wdXNoKCdBbm9ueW1vdXMnKTtcbiAgICAgICAgZWxzZSBpZiAoZGF0YS5hbm9ucykgdGFncy5wdXNoKCdBbm9ueW1vdXMgKCcgKyBkYXRhLmFub25zICsgJyknKTtcbiAgICAgICAgdGhpcy5saXN0Lmh0bWwodGFncy5qb2luKCcsICcpKTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMubnVtYmVyLmxlbmd0aCkgdGhpcy5saXN0Lmh0bWwoZGF0YS5uYiArICcgcGxheWVycyBpbiB0aGUgY2hhdCcpO1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCdub25lJyk7XG4gICAgfVxuICB9KTtcblxuICBsaWNoZXNzLndpZGdldChcImZyaWVuZHNcIiwgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBnZXRJZCA9IGZ1bmN0aW9uKHRpdGxlTmFtZSkge1xuICAgICAgcmV0dXJuIHRpdGxlTmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL15cXHcrXFxzLywgJycpO1xuICAgIH07XG4gICAgdmFyIG1ha2VVc2VyID0gZnVuY3Rpb24odGl0bGVOYW1lKSB7XG4gICAgICB2YXIgc3BsaXQgPSB0aXRsZU5hbWUuc3BsaXQoJyAnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBuYW1lOiBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXSxcbiAgICAgICAgdGl0bGU6IChzcGxpdC5sZW5ndGggPiAxKSA/IHNwbGl0WzBdIDogdW5kZWZpbmVkLFxuICAgICAgICBwbGF5aW5nOiBmYWxzZSxcbiAgICAgICAgc3R1ZHlpbmc6IGZhbHNlLFxuICAgICAgICBwYXRyb246IGZhbHNlXG4gICAgICB9O1xuICAgIH07XG4gICAgdmFyIHJlbmRlclVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICB2YXIgaWNvbiA9ICc8aSBjbGFzcz1cImxpbmUnICsgKHVzZXIucGF0cm9uID8gJyBwYXRyb24nIDogJycpICsgJ1wiPjwvaT4nO1xuICAgICAgdmFyIHRpdGxlVGFnID0gdXNlci50aXRsZSA/ICgnPHNwYW4gY2xhc3M9XCJ0aXRsZVwiJyArICh1c2VyLnRpdGxlID09PSAnQk9UJyA/ICcgZGF0YS1ib3QnIDogJycpICsgJz4nICsgdXNlci50aXRsZSArICc8L3NwYW4+Jm5ic3A7JykgOiAnJztcbiAgICAgIHZhciB1cmwgPSAnL0AvJyArIHVzZXIubmFtZTtcbiAgICAgIHZhciB0dkJ1dHRvbiA9IHVzZXIucGxheWluZyA/ICc8YSBkYXRhLWljb249XCIxXCIgY2xhc3M9XCJ0diB1bHB0XCIgZGF0YS1wdC1wb3M9XCJud1wiIGhyZWY9XCInICsgdXJsICsgJy90dlwiIGRhdGEtaHJlZj1cIicgKyB1cmwgKyAnXCI+PC9hPicgOiAnJztcbiAgICAgIHZhciBzdHVkeUJ1dHRvbiA9IHVzZXIuc3R1ZHlpbmcgPyAnPGEgZGF0YS1pY29uPVwiNFwiIGNsYXNzPVwiZnJpZW5kLXN0dWR5XCIgaHJlZj1cIicgKyB1cmwgKyAnL3N0dWR5VHZcIj48L2E+JyA6ICcnO1xuICAgICAgdmFyIHJpZ2h0QnV0dG9uID0gdHZCdXR0b24gfHwgc3R1ZHlCdXR0b247XG4gICAgICByZXR1cm4gJzxkaXY+PGEgY2xhc3M9XCJ1c2VyLWxpbmsgdWxwdFwiIGRhdGEtcHQtcG9zPVwibndcIiBocmVmPVwiJyArIHVybCArICdcIj4nICsgaWNvbiArIHRpdGxlVGFnICsgdXNlci5uYW1lICsgJzwvYT4nICsgcmlnaHRCdXR0b24gKyAnPC9kaXY+JztcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgZWwgPSBzZWxmLmVsZW1lbnQ7XG5cbiAgICAgICAgdmFyIGhpZGVTdG9yYWdlID0gbGljaGVzcy5zdG9yYWdlLm1ha2VCb29sZWFuKCdmcmllbmRzLWhpZGUnKTtcbiAgICAgICAgc2VsZi4kZnJpZW5kQm94VGl0bGUgPSBlbC5maW5kKCcuZnJpZW5kX2JveF90aXRsZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGVsLmZpbmQoJy5jb250ZW50X3dyYXAnKS50b2dnbGVOb25lKGhpZGVTdG9yYWdlLmdldCgpKTtcbiAgICAgICAgICBoaWRlU3RvcmFnZS50b2dnbGUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoaWRlU3RvcmFnZS5nZXQoKSA9PSAxKSBlbC5maW5kKCcuY29udGVudF93cmFwJykuYWRkQ2xhc3MoJ25vbmUnKTtcblxuICAgICAgICBzZWxmLiRub2JvZHkgPSBlbC5maW5kKFwiLm5vYm9keVwiKTtcblxuICAgICAgICBjb25zdCBkYXRhID0gZWwuZGF0YSgncHJlbG9hZCcpO1xuICAgICAgICBzZWxmLnRyYW5zID0gbGljaGVzcy50cmFucyhkYXRhLmkxOG4pO1xuICAgICAgICBzZWxmLnNldChkYXRhKTtcbiAgICAgIH0sXG4gICAgICByZXBhaW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGljaGVzcy5yYWYoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHVzZXJzID0gdGhpcy51c2VycywgaWRzID0gT2JqZWN0LmtleXModXNlcnMpLnNvcnQoKTtcbiAgICAgICAgICB0aGlzLiRmcmllbmRCb3hUaXRsZS5odG1sKHRoaXMudHJhbnMudmRvbVBsdXJhbCgnbmJGcmllbmRzT25saW5lJywgaWRzLmxlbmd0aCwgJCgnPHN0cm9uZz4nKS50ZXh0KGlkcy5sZW5ndGgpKSk7XG4gICAgICAgICAgdGhpcy4kbm9ib2R5LnRvZ2dsZU5vbmUoIWlkcy5sZW5ndGgpO1xuICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKCcubGlzdCcpLmh0bWwoXG4gICAgICAgICAgICBpZHMubWFwKGZ1bmN0aW9uKGlkKSB7IHJldHVybiByZW5kZXJVc2VyKHVzZXJzW2lkXSk7IH0pLmpvaW4oJycpXG4gICAgICAgICAgKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgIH0sXG4gICAgICBpbnNlcnQ6IGZ1bmN0aW9uKHRpdGxlTmFtZSkge1xuICAgICAgICBjb25zdCBpZCA9IGdldElkKHRpdGxlTmFtZSk7XG4gICAgICAgIGlmICghdGhpcy51c2Vyc1tpZF0pIHRoaXMudXNlcnNbaWRdID0gbWFrZVVzZXIodGl0bGVOYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlcnNbaWRdO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oZCkge1xuICAgICAgICB0aGlzLnVzZXJzID0ge307XG4gICAgICAgIGxldCBpO1xuICAgICAgICBmb3IgKGkgaW4gZC51c2VycykgdGhpcy5pbnNlcnQoZC51c2Vyc1tpXSk7XG4gICAgICAgIGZvciAoaSBpbiBkLnBsYXlpbmcpIHRoaXMuaW5zZXJ0KGQucGxheWluZ1tpXSkucGxheWluZyA9IHRydWU7XG4gICAgICAgIGZvciAoaSBpbiBkLnN0dWR5aW5nKSB0aGlzLmluc2VydChkLnN0dWR5aW5nW2ldKS5zdHVkeWluZyA9IHRydWU7XG4gICAgICAgIGZvciAoaSBpbiBkLnBhdHJvbnMpIHRoaXMuaW5zZXJ0KGQucGF0cm9uc1tpXSkucGF0cm9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZXBhaW50KCk7XG4gICAgICB9LFxuICAgICAgZW50ZXJzOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIGNvbnN0IHVzZXIgPSB0aGlzLmluc2VydChkLmQpO1xuICAgICAgICB1c2VyLnBsYXlpbmcgPSBkLnBsYXlpbmc7XG4gICAgICAgIHVzZXIuc3R1ZHlpbmcgPSBkLnN0dWR5aW5nO1xuICAgICAgICB1c2VyLnBhdHJvbiA9IGQucGF0cm9uO1xuICAgICAgICB0aGlzLnJlcGFpbnQoKTtcbiAgICAgIH0sXG4gICAgICBsZWF2ZXM6IGZ1bmN0aW9uKHRpdGxlTmFtZSkge1xuICAgICAgICBkZWxldGUgdGhpcy51c2Vyc1tnZXRJZCh0aXRsZU5hbWUpXTtcbiAgICAgICAgdGhpcy5yZXBhaW50KCk7XG4gICAgICB9LFxuICAgICAgcGxheWluZzogZnVuY3Rpb24odGl0bGVOYW1lKSB7XG4gICAgICAgIHRoaXMuaW5zZXJ0KHRpdGxlTmFtZSkucGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucmVwYWludCgpO1xuICAgICAgfSxcbiAgICAgIHN0b3BwZWRfcGxheWluZzogZnVuY3Rpb24odGl0bGVOYW1lKSB7XG4gICAgICAgIHRoaXMuaW5zZXJ0KHRpdGxlTmFtZSkucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlcGFpbnQoKTtcbiAgICAgIH0sXG4gICAgICBzdHVkeV9qb2luOiBmdW5jdGlvbih0aXRsZU5hbWUpIHtcbiAgICAgICAgdGhpcy5pbnNlcnQodGl0bGVOYW1lKS5zdHVkeWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMucmVwYWludCgpO1xuICAgICAgfSxcbiAgICAgIHN0dWR5X2xlYXZlOiBmdW5jdGlvbih0aXRsZU5hbWUpIHtcbiAgICAgICAgdGhpcy5pbnNlcnQodGl0bGVOYW1lKS5zdHVkeWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlcGFpbnQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KSgpKTtcblxuICBsaWNoZXNzLndpZGdldChcImNsb2NrXCIsIHtcbiAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIC8vIHRoaXMub3B0aW9ucy50aW1lOiBzZWNvbmRzIEludGVnZXJcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLm9wdGlvbnMudGltZSAqIDEwMDAgKyBEYXRlLm5vdygpO1xuICAgICAgdmFyIHRpbWVFbCA9IHRoaXMuZWxlbWVudC5maW5kKCcudGltZScpWzBdO1xuICAgICAgdmFyIHRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHRhcmdldCAtIERhdGUubm93KCk7XG4gICAgICAgIGlmIChyZW1haW5pbmcgPD0gMCkgY2xlYXJJbnRlcnZhbChzZWxmLmludGVydmFsKTtcbiAgICAgICAgdGltZUVsLmlubmVySFRNTCA9IHNlbGYuX2Zvcm1hdE1zKHJlbWFpbmluZyk7XG4gICAgICB9O1xuICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKHRpY2ssIDEwMDApO1xuICAgICAgdGljaygpO1xuICAgIH0sXG5cbiAgICBfcGFkOiBmdW5jdGlvbih4KSB7IHJldHVybiAoeCA8IDEwID8gJzAnIDogJycpICsgeDsgfSxcblxuICAgIF9mb3JtYXRNczogZnVuY3Rpb24obXNUaW1lKSB7XG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKE1hdGgubWF4KDAsIG1zVGltZSArIDUwMCkpO1xuXG4gICAgICB2YXIgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCksXG4gICAgICAgIG1pbnV0ZXMgPSBkYXRlLmdldFVUQ01pbnV0ZXMoKSxcbiAgICAgICAgc2Vjb25kcyA9IGRhdGUuZ2V0VVRDU2Vjb25kcygpO1xuXG4gICAgICBpZiAoaG91cnMgPiAwKSB7XG4gICAgICAgIHJldHVybiBob3VycyArICc6JyArIHRoaXMuX3BhZChtaW51dGVzKSArICc6JyArIHRoaXMuX3BhZChzZWNvbmRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBtaW51dGVzICsgJzonICsgdGhpcy5fcGFkKHNlY29uZHMpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICBsaWNoZXNzLnB1YnN1Yi5vbignY29udGVudF9sb2FkZWQnLCBsaWNoZXNzLnBhcnNlRmVuKTtcblxuICAgIHZhciBzb2NrZXRPcGVuZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0V2F0Y2hpbmcoKSB7XG4gICAgICBpZiAoIXNvY2tldE9wZW5lZCkgcmV0dXJuO1xuICAgICAgdmFyIGlkcyA9IFtdO1xuICAgICAgJCgnLm1pbmktYm9hcmQubGl2ZScpLnJlbW92ZUNsYXNzKFwibGl2ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZHMucHVzaCh0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtbGl2ZVwiKSk7XG4gICAgICB9KTtcbiAgICAgIGlmIChpZHMubGVuZ3RoKSBsaWNoZXNzLnNvY2tldC5zZW5kKFwic3RhcnRXYXRjaGluZ1wiLCBpZHMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgICBsaWNoZXNzLnB1YnN1Yi5vbignY29udGVudF9sb2FkZWQnLCBzdGFydFdhdGNoaW5nKTtcbiAgICBsaWNoZXNzLnB1YnN1Yi5vbignc29ja2V0Lm9wZW4nLCBmdW5jdGlvbigpIHtcbiAgICAgIHNvY2tldE9wZW5lZCA9IHRydWU7XG4gICAgICBzdGFydFdhdGNoaW5nKCk7XG4gICAgfSk7XG5cbiAgICBsaWNoZXNzLnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgICBsaWNoZXNzLnBhcnNlRmVuKCk7XG4gICAgICAkKCcuY2hhdF9fbWVtYmVycycpLndhdGNoZXJzKCk7XG4gICAgICBpZiAobG9jYXRpb24uaGFzaCA9PT0gJyNibGluZCcgJiYgISQoJ2JvZHknKS5oYXNDbGFzcygnYmxpbmQtbW9kZScpKVxuICAgICAgICAkLnBvc3QoJy90b2dnbGUtYmxpbmQtbW9kZScsIHsgZW5hYmxlOiAxLCByZWRpcmVjdDogJy8nIH0sIGxpY2hlc3MucmVsb2FkKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyB0b3VybmFtZW50LmpzIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBmdW5jdGlvbiBzdGFydFRvdXJuYW1lbnQoY2ZnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtYWluLnRvdXInKTtcbiAgICAkKCdib2R5JykuZGF0YSgndG91cm5hbWVudC1pZCcsIGNmZy5kYXRhLmlkKTtcbiAgICB2YXIgdG91cm5hbWVudDtcbiAgICBsaWNoZXNzLnNvY2tldCA9IGxpY2hlc3MuU3Ryb25nU29ja2V0KFxuICAgICAgJy90b3VybmFtZW50LycgKyBjZmcuZGF0YS5pZCArICcvc29ja2V0L3Y0JywgY2ZnLmRhdGEuc29ja2V0VmVyc2lvbiwge1xuICAgICAgICByZWNlaXZlOiBmdW5jdGlvbih0LCBkKSB7XG4gICAgICAgICAgcmV0dXJuIHRvdXJuYW1lbnQuc29ja2V0UmVjZWl2ZSh0LCBkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgY2ZnLnNvY2tldFNlbmQgPSBsaWNoZXNzLnNvY2tldC5zZW5kO1xuICAgIGNmZy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICBjZmcuJHNpZGUgPSAkKCcudG91cl9fc2lkZScpLmNsb25lKCk7XG4gICAgY2ZnLiRmYXEgPSAkKCcudG91cl9fZmFxJykuY2xvbmUoKTtcbiAgICB0b3VybmFtZW50ID0gTGljaGVzc1RvdXJuYW1lbnQuc3RhcnQoY2ZnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0U2ltdWwoY2ZnKSB7XG4gICAgY2ZnLmVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtYWluLnNpbXVsJyk7XG4gICAgJCgnYm9keScpLmRhdGEoJ3NpbXVsLWlkJywgY2ZnLmRhdGEuaWQpO1xuICAgIHZhciBzaW11bDtcbiAgICBsaWNoZXNzLnNvY2tldCA9IGxpY2hlc3MuU3Ryb25nU29ja2V0KFxuICAgICAgJy9zaW11bC8nICsgY2ZnLmRhdGEuaWQgKyAnL3NvY2tldC92NCcsIGNmZy5zb2NrZXRWZXJzaW9uLCB7XG4gICAgICAgIHJlY2VpdmU6IGZ1bmN0aW9uKHQsIGQpIHtcbiAgICAgICAgICBzaW11bC5zb2NrZXRSZWNlaXZlKHQsIGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBjZmcuc29ja2V0U2VuZCA9IGxpY2hlc3Muc29ja2V0LnNlbmQ7XG4gICAgY2ZnLiRzaWRlID0gJCgnLnNpbXVsX19zaWRlJykuY2xvbmUoKTtcbiAgICBzaW11bCA9IExpY2hlc3NTaW11bChjZmcpO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vL1xuICAvLyB1c2VyX2FuYWx5c2lzLmpzIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy9cblxuICBmdW5jdGlvbiBzdGFydFVzZXJBbmFseXNpcyhjZmcpIHtcbiAgICB2YXIgYW5hbHlzZTtcbiAgICBjZmcuaW5pdGlhbFBseSA9ICd1cmwnO1xuICAgIGNmZy50cmFucyA9IGxpY2hlc3MudHJhbnMoY2ZnLmkxOG4pO1xuICAgIGxpY2hlc3Muc29ja2V0ID0gbGljaGVzcy5TdHJvbmdTb2NrZXQoJy9hbmFseXNpcy9zb2NrZXQvdjQnLCBmYWxzZSwge1xuICAgICAgcmVjZWl2ZTogZnVuY3Rpb24odCwgZCkge1xuICAgICAgICBhbmFseXNlLnNvY2tldFJlY2VpdmUodCwgZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2ZnLnNvY2tldFNlbmQgPSBsaWNoZXNzLnNvY2tldC5zZW5kO1xuICAgIGNmZy4kc2lkZSA9ICQoJy5hbmFseXNlX19zaWRlJykuY2xvbmUoKTtcbiAgICBhbmFseXNlID0gTGljaGVzc0FuYWx5c2Uuc3RhcnQoY2ZnKTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gc3R1ZHkuanMgLy9cbiAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gIGZ1bmN0aW9uIHN0YXJ0U3R1ZHkoY2ZnKSB7XG4gICAgdmFyIGFuYWx5c2U7XG4gICAgY2ZnLmluaXRpYWxQbHkgPSAndXJsJztcbiAgICBsaWNoZXNzLnNvY2tldCA9IGxpY2hlc3MuU3Ryb25nU29ja2V0KGNmZy5zb2NrZXRVcmwsIGNmZy5zb2NrZXRWZXJzaW9uLCB7XG4gICAgICByZWNlaXZlOiBmdW5jdGlvbih0LCBkKSB7XG4gICAgICAgIGFuYWx5c2Uuc29ja2V0UmVjZWl2ZSh0LCBkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjZmcuc29ja2V0U2VuZCA9IGxpY2hlc3Muc29ja2V0LnNlbmQ7XG4gICAgY2ZnLnRyYW5zID0gbGljaGVzcy50cmFucyhjZmcuaTE4bik7XG4gICAgYW5hbHlzZSA9IExpY2hlc3NBbmFseXNlLnN0YXJ0KGNmZyk7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vLy8vXG4gIC8vIHByYWN0aWNlLmpzIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy9cblxuICBmdW5jdGlvbiBzdGFydFByYWN0aWNlKGNmZykge1xuICAgIHZhciBhbmFseXNlO1xuICAgIGNmZy50cmFucyA9IGxpY2hlc3MudHJhbnMoY2ZnLmkxOG4pO1xuICAgIGxpY2hlc3Muc29ja2V0ID0gbGljaGVzcy5TdHJvbmdTb2NrZXQoJy9hbmFseXNpcy9zb2NrZXQvdjQnLCBmYWxzZSwge1xuICAgICAgcmVjZWl2ZTogZnVuY3Rpb24odCwgZCkge1xuICAgICAgICBhbmFseXNlLnNvY2tldFJlY2VpdmUodCwgZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2ZnLnNvY2tldFNlbmQgPSBsaWNoZXNzLnNvY2tldC5zZW5kO1xuICAgIGFuYWx5c2UgPSBMaWNoZXNzQW5hbHlzZS5zdGFydChjZmcpO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vL1xuICAvLyByZWxheS5qcyAvL1xuICAvLy8vLy8vLy8vLy8vLy8vXG5cbiAgZnVuY3Rpb24gc3RhcnRSZWxheShjZmcpIHtcbiAgICB2YXIgYW5hbHlzZTtcbiAgICBjZmcuaW5pdGlhbFBseSA9ICd1cmwnO1xuICAgIGxpY2hlc3Muc29ja2V0ID0gbGljaGVzcy5TdHJvbmdTb2NrZXQoY2ZnLnNvY2tldFVybCwgY2ZnLnNvY2tldFZlcnNpb24sIHtcbiAgICAgIHJlY2VpdmU6IGZ1bmN0aW9uKHQsIGQpIHtcbiAgICAgICAgYW5hbHlzZS5zb2NrZXRSZWNlaXZlKHQsIGQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNmZy5zb2NrZXRTZW5kID0gbGljaGVzcy5zb2NrZXQuc2VuZDtcbiAgICBjZmcudHJhbnMgPSBsaWNoZXNzLnRyYW5zKGNmZy5pMThuKTtcbiAgICBhbmFseXNlID0gTGljaGVzc0FuYWx5c2Uuc3RhcnQoY2ZnKTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gcHV6emxlLmpzIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy9cblxuICBmdW5jdGlvbiBzdGFydFB1enpsZShjZmcpIHtcbiAgICB2YXIgcHV6emxlO1xuICAgIGNmZy5lbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWFpbi5wdXp6bGUnKTtcbiAgICBsaWNoZXNzLnNvY2tldCA9IGxpY2hlc3MuU3Ryb25nU29ja2V0KCcvc29ja2V0L3Y0JywgZmFsc2UsIHtcbiAgICAgIHJlY2VpdmU6IGZ1bmN0aW9uKHQsIGQpIHtcbiAgICAgICAgcHV6emxlLnNvY2tldFJlY2VpdmUodCwgZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2ZnLnNvY2tldFNlbmQgPSBsaWNoZXNzLnNvY2tldC5zZW5kO1xuICAgIHB1enpsZSA9IExpY2hlc3NQdXp6bGUuZGVmYXVsdChjZmcpO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gc2VydmljZSB3b3JrZXIgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvciAmJiAnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cgJiYgJ1B1c2hNYW5hZ2VyJyBpbiB3aW5kb3cpIHtcbiAgICBjb25zdCB3b3JrZXJVcmwgPSBuZXcgVVJMKGxpY2hlc3MuYXNzZXRVcmwobGljaGVzcy5jb21waWxlZFNjcmlwdCgnc2VydmljZVdvcmtlcicpLCB7c2FtZURvbWFpbjogdHJ1ZX0pLCBzZWxmLmxvY2F0aW9uLmhyZWYpO1xuICAgIHdvcmtlclVybC5zZWFyY2hQYXJhbXMuc2V0KCdhc3NldC11cmwnLCBkb2N1bWVudC5ib2R5LmdldEF0dHJpYnV0ZSgnZGF0YS1hc3NldC11cmwnKSk7XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLWRldicpKSB3b3JrZXJVcmwuc2VhcmNoUGFyYW1zLnNldCgnZGV2JywgJzEnKTtcbiAgICBjb25zdCB1cGRhdGVWaWFDYWNoZSA9IGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLWRldicpID8gJ25vbmUnIDogJ2FsbCc7XG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIod29ya2VyVXJsLmhyZWYsIHtzY29wZTogJy8nLCB1cGRhdGVWaWFDYWNoZX0pLnRoZW4ocmVnID0+IHtcbiAgICAgIGNvbnN0IHN0b3JhZ2UgPSBsaWNoZXNzLnN0b3JhZ2UubWFrZSgncHVzaC1zdWJzY3JpYmVkJyk7XG4gICAgICBjb25zdCB2YXBpZCA9IGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLXZhcGlkJyk7XG4gICAgICBpZiAodmFwaWQgJiYgTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT0gJ2dyYW50ZWQnKSByZXR1cm4gcmVnLnB1c2hNYW5hZ2VyLmdldFN1YnNjcmlwdGlvbigpLnRoZW4oc3ViID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWIgPSBwYXJzZUludChzdG9yYWdlLmdldCgpIHx8ICcwJywgMTApICsgNDMyMDAwMDAgPCBEYXRlLm5vdygpOyAvLyAxMiBob3Vyc1xuICAgICAgICBjb25zdCBhcHBsaWNhdGlvblNlcnZlcktleSA9IFVpbnQ4QXJyYXkuZnJvbShhdG9iKHZhcGlkKSwgYyA9PiBjLmNoYXJDb2RlQXQoMCkpO1xuICAgICAgICBpZiAoIXN1YiB8fCByZXN1Yikge1xuICAgICAgICAgIHJldHVybiByZWcucHVzaE1hbmFnZXIuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgIHVzZXJWaXNpYmxlT25seTogdHJ1ZSxcbiAgICAgICAgICAgIGFwcGxpY2F0aW9uU2VydmVyS2V5OiBhcHBsaWNhdGlvblNlcnZlcktleVxuICAgICAgICAgIH0pLnRoZW4oc3ViID0+IGZldGNoKCcvcHVzaC9zdWJzY3JpYmUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHN1YilcbiAgICAgICAgICB9KS50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICBpZiAocmVzLm9rKSBzdG9yYWdlLnNldCgnJyArIERhdGUubm93KCkpO1xuICAgICAgICAgICAgZWxzZSBjb25zb2xlLmxvZygnc3VibWl0dGluZyBwdXNoIHN1YnNjcmlwdGlvbiBmYWlsZWQnLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgICB9KSwgZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwdXNoIHN1YnNjcmliZSBmYWlsZWQnLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoc3ViKSBzdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBlbHNlIHN0b3JhZ2UucmVtb3ZlKCk7XG4gICAgfSk7XG4gIH1cbn0pKCk7XG4iLCJmdW5jdGlvbiBtYWtlQWNrYWJsZShzZW5kKSB7XG5cbiAgdmFyIGN1cnJlbnRJZCA9IDE7IC8vIGluY3JlbWVudCB3aXRoIGVhY2ggYWNrYWJsZSBtZXNzYWdlIHNlbnRcblxuICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICBmdW5jdGlvbiByZXNlbmQoKSB7XG4gICAgdmFyIHJlc2VuZEN1dG9mZiA9IHBlcmZvcm1hbmNlLm5vdygpIC0gMjUwMDtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG0pIHtcbiAgICAgIGlmIChtLmF0IDwgcmVzZW5kQ3V0b2ZmKSBzZW5kKG0udCwgbS5kKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldEludGVydmFsKHJlc2VuZCwgMTAwMCk7XG5cbiAgcmV0dXJuIHtcbiAgICByZXNlbmQ6IHJlc2VuZCxcbiAgICByZWdpc3RlcjogZnVuY3Rpb24odCwgZCkge1xuICAgICAgZC5hID0gY3VycmVudElkKys7XG4gICAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgdDogdCxcbiAgICAgICAgZDogZCxcbiAgICAgICAgYXQ6IHBlcmZvcm1hbmNlLm5vdygpXG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdvdEFjazogZnVuY3Rpb24oaWQpIHtcbiAgICAgIG1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgcmV0dXJuIG0uZC5hICE9PSBpZDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gdmVyc2lvbmVkIGV2ZW50cywgYWNrcywgcmV0cmllcywgcmVzeW5jXG5saWNoZXNzLlN0cm9uZ1NvY2tldCA9IGZ1bmN0aW9uKHVybCwgdmVyc2lvbiwgc2V0dGluZ3MpIHtcblxuICB2YXIgc2V0dGluZ3MgPSAkLmV4dGVuZCh0cnVlLCB7fSwgbGljaGVzcy5TdHJvbmdTb2NrZXQuZGVmYXVsdHMsIHNldHRpbmdzKTtcbiAgdmFyIG9wdGlvbnMgPSBzZXR0aW5ncy5vcHRpb25zO1xuICB2YXIgd3M7XG4gIHZhciBwaW5nU2NoZWR1bGU7XG4gIHZhciBjb25uZWN0U2NoZWR1bGU7XG4gIHZhciBhY2thYmxlID0gbWFrZUFja2FibGUoKHQsIGQpID0+IHNlbmQodCwgZCkpO1xuICB2YXIgbGFzdFBpbmdUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gIHZhciBwb25nQ291bnQgPSAwO1xuICB2YXIgYXZlcmFnZUxhZyA9IDA7XG4gIHZhciB0cnlPdGhlclVybCA9IGZhbHNlO1xuICB2YXIgYXV0b1JlY29ubmVjdCA9IHRydWU7XG4gIHZhciBuYkNvbm5lY3RzID0gMDtcbiAgdmFyIHN0b3JhZ2UgPSBsaWNoZXNzLnN0b3JhZ2UubWFrZSgnc3VybDYnKTtcblxuICB2YXIgY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIGRlc3Ryb3koKTtcbiAgICBhdXRvUmVjb25uZWN0ID0gdHJ1ZTtcbiAgICB2YXIgcGFyYW1zID0gJC5wYXJhbShzZXR0aW5ncy5wYXJhbXMpO1xuICAgIGlmICh2ZXJzaW9uICE9PSBmYWxzZSkgcGFyYW1zICs9IChwYXJhbXMgPyAnJicgOiAnJykgKyAndj0nICsgdmVyc2lvbjtcbiAgICB2YXIgZnVsbFVybCA9IG9wdGlvbnMucHJvdG9jb2wgKyAnLy8nICsgYmFzZVVybCgpICsgdXJsICsgJz8nICsgcGFyYW1zO1xuICAgIGRlYnVnKFwiY29ubmVjdGlvbiBhdHRlbXB0IHRvIFwiICsgZnVsbFVybCk7XG4gICAgdHJ5IHtcbiAgICAgIHdzID0gbmV3IFdlYlNvY2tldChmdWxsVXJsKTtcbiAgICAgIHdzLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIG9uRXJyb3IoZSk7XG4gICAgICB9O1xuICAgICAgd3Mub25jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQuY2xvc2UnKTtcbiAgICAgICAgaWYgKGF1dG9SZWNvbm5lY3QpIHtcbiAgICAgICAgICBkZWJ1ZygnV2lsbCBhdXRvcmVjb25uZWN0IGluICcgKyBvcHRpb25zLmF1dG9SZWNvbm5lY3REZWxheSk7XG4gICAgICAgICAgc2NoZWR1bGVDb25uZWN0KG9wdGlvbnMuYXV0b1JlY29ubmVjdERlbGF5KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHdzLm9ub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWJ1ZyhcImNvbm5lY3RlZCB0byBcIiArIGZ1bGxVcmwpO1xuICAgICAgICBvblN1Y2Nlc3MoKTtcbiAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdvZmZsaW5lJykuYWRkQ2xhc3MoJ29ubGluZScpLmFkZENsYXNzKG5iQ29ubmVjdHMgPiAxID8gJ3JlY29ubmVjdGVkJyA6ICcnKTtcbiAgICAgICAgcGluZ05vdygpO1xuICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQub3BlbicpO1xuICAgICAgICBhY2thYmxlLnJlc2VuZCgpO1xuICAgICAgfTtcbiAgICAgIHdzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUuZGF0YSA9PSAwKSByZXR1cm4gcG9uZygpO1xuICAgICAgICBjb25zdCBtID0gSlNPTi5wYXJzZShlLmRhdGEpO1xuICAgICAgICBpZiAobS50ID09PSAnbicpIHBvbmcoKTtcbiAgICAgICAgaGFuZGxlKG0pO1xuICAgICAgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBvbkVycm9yKGUpO1xuICAgIH1cbiAgICBzY2hlZHVsZUNvbm5lY3Qob3B0aW9ucy5waW5nTWF4TGFnKTtcbiAgfTtcblxuICB2YXIgc2VuZCA9IGZ1bmN0aW9uKHQsIGQsIG8sIG5vUmV0cnkpIHtcbiAgICBvID0gbyB8fCB7fTtcbiAgICB2YXIgbXNnID0geyB0OiB0IH07XG4gICAgaWYgKGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKG8ud2l0aExhZykgZC5sID0gTWF0aC5yb3VuZChhdmVyYWdlTGFnKTtcbiAgICAgIGlmIChvLm1pbGxpcyA+PSAwKSBkLnMgPSBNYXRoLnJvdW5kKG8ubWlsbGlzICogMC4xKS50b1N0cmluZygzNik7XG4gICAgICBtc2cuZCA9IGQ7XG4gICAgfVxuICAgIGlmIChvLmFja2FibGUpIHtcbiAgICAgIG1zZy5kID0gbXNnLmQgfHwge307IC8vIGNhbid0IGFjayBtZXNzYWdlIHdpdGhvdXQgZGF0YVxuICAgICAgYWNrYWJsZS5yZWdpc3Rlcih0LCBtc2cuZCk7IC8vIGFkZHMgZC5hLCB0aGUgYWNrIElEIHdlIGV4cGVjdCB0byBnZXQgYmFja1xuICAgIH1cbiAgICB2YXIgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KG1zZyk7XG4gICAgZGVidWcoXCJzZW5kIFwiICsgbWVzc2FnZSk7XG4gICAgdHJ5IHtcbiAgICAgIHdzLnNlbmQobWVzc2FnZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gbWF5YmUgc2VudCBiZWZvcmUgc29ja2V0IG9wZW5zLFxuICAgICAgLy8gdHJ5IGFnYWluIGEgc2Vjb25kIGxhdGVyLlxuICAgICAgaWYgKCFub1JldHJ5KSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzZW5kKHQsIG1zZy5kLCBvLCB0cnVlKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH1cbiAgfTtcbiAgbGljaGVzcy5wdWJzdWIub24oJ3NvY2tldC5zZW5kJywgc2VuZCk7XG5cbiAgdmFyIHNjaGVkdWxlQ29ubmVjdCA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgaWYgKG9wdGlvbnMuaWRsZSkgZGVsYXkgPSAxMCAqIDEwMDAgKyBNYXRoLnJhbmRvbSgpICogMTAgKiAxMDAwO1xuICAgIC8vIGRlYnVnKCdzY2hlZHVsZSBjb25uZWN0ICcgKyBkZWxheSk7XG4gICAgY2xlYXJUaW1lb3V0KHBpbmdTY2hlZHVsZSk7XG4gICAgY2xlYXJUaW1lb3V0KGNvbm5lY3RTY2hlZHVsZSk7XG4gICAgY29ubmVjdFNjaGVkdWxlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnb2ZmbGluZScpLnJlbW92ZUNsYXNzKCdvbmxpbmUnKTtcbiAgICAgIHRyeU90aGVyVXJsID0gdHJ1ZTtcbiAgICAgIGNvbm5lY3QoKTtcbiAgICB9LCBkZWxheSk7XG4gIH07XG5cbiAgdmFyIHNjaGVkdWxlUGluZyA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgY2xlYXJUaW1lb3V0KHBpbmdTY2hlZHVsZSk7XG4gICAgcGluZ1NjaGVkdWxlID0gc2V0VGltZW91dChwaW5nTm93LCBkZWxheSk7XG4gIH07XG5cbiAgdmFyIHBpbmdOb3cgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQocGluZ1NjaGVkdWxlKTtcbiAgICBjbGVhclRpbWVvdXQoY29ubmVjdFNjaGVkdWxlKTtcbiAgICB2YXIgcGluZ0RhdGEgPSAob3B0aW9ucy5pc0F1dGggJiYgcG9uZ0NvdW50ICUgOCA9PSAyKSA/IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIHQ6ICdwJyxcbiAgICAgIGw6IE1hdGgucm91bmQoMC4xICogYXZlcmFnZUxhZylcbiAgICB9KSA6IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHdzLnNlbmQocGluZ0RhdGEpO1xuICAgICAgbGFzdFBpbmdUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGVidWcoZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHNjaGVkdWxlQ29ubmVjdChvcHRpb25zLnBpbmdNYXhMYWcpO1xuICB9O1xuXG4gIHZhciBjb21wdXRlUGluZ0RlbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMucGluZ0RlbGF5ICsgKG9wdGlvbnMuaWRsZSA/IDEwMDAgOiAwKTtcbiAgfTtcblxuICB2YXIgcG9uZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dChjb25uZWN0U2NoZWR1bGUpO1xuICAgIHNjaGVkdWxlUGluZyhjb21wdXRlUGluZ0RlbGF5KCkpO1xuICAgIHZhciBjdXJyZW50TGFnID0gTWF0aC5taW4ocGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0UGluZ1RpbWUsIDEwMDAwKTtcbiAgICBwb25nQ291bnQrKztcblxuICAgIC8vIEF2ZXJhZ2UgZmlyc3QgNCBwaW5ncywgdGhlbiBzd2l0Y2ggdG8gZGVjYXlpbmcgYXZlcmFnZS5cbiAgICB2YXIgbWl4ID0gcG9uZ0NvdW50ID4gNCA/IDAuMSA6IDEgLyBwb25nQ291bnQ7XG4gICAgYXZlcmFnZUxhZyArPSBtaXggKiAoY3VycmVudExhZyAtIGF2ZXJhZ2VMYWcpO1xuXG4gICAgbGljaGVzcy5wdWJzdWIuZW1pdCgnc29ja2V0LmxhZycsIGF2ZXJhZ2VMYWcpO1xuICB9O1xuXG4gIHZhciBoYW5kbGUgPSBmdW5jdGlvbihtKSB7XG4gICAgaWYgKG0udikge1xuICAgICAgaWYgKG0udiA8PSB2ZXJzaW9uKSB7XG4gICAgICAgIGRlYnVnKFwiYWxyZWFkeSBoYXMgZXZlbnQgXCIgKyBtLnYpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBpdCdzIGltcG9zc2libGUgYnV0IGFjY29yZGluZyB0byBwcmV2aW91cyBsb2dpbiwgaXQgaGFwcGVucyBub25ldGhlbGVzc1xuICAgICAgaWYgKG0udiA+IHZlcnNpb24gKyAxKSByZXR1cm4gbGljaGVzcy5yZWxvYWQoKTtcbiAgICAgIHZlcnNpb24gPSBtLnY7XG4gICAgfVxuICAgIHN3aXRjaCAobS50IHx8IGZhbHNlKSB7XG4gICAgICBjYXNlIGZhbHNlOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Jlc3luYyc6XG4gICAgICAgIGxpY2hlc3MucmVsb2FkKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWNrJzpcbiAgICAgICAgYWNrYWJsZS5nb3RBY2sobS5kKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsaWNoZXNzLnB1YnN1Yi5lbWl0KCdzb2NrZXQuaW4uJyArIG0udCwgbS5kKTtcbiAgICAgICAgdmFyIHByb2Nlc3NlZCA9IHNldHRpbmdzLnJlY2VpdmUgJiYgc2V0dGluZ3MucmVjZWl2ZShtLnQsIG0uZCk7XG4gICAgICAgIGlmICghcHJvY2Vzc2VkICYmIHNldHRpbmdzLmV2ZW50c1ttLnRdKSBzZXR0aW5ncy5ldmVudHNbbS50XShtLmQgfHwgbnVsbCwgbSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkZWJ1ZyA9IGZ1bmN0aW9uKG1zZywgYWx3YXlzKSB7XG4gICAgaWYgKGFsd2F5cyB8fCBvcHRpb25zLmRlYnVnKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKFwiW1wiICsgb3B0aW9ucy5uYW1lICsgXCIgXCIgKyBzZXR0aW5ncy5wYXJhbXMuc3JpICsgXCJdXCIsIG1zZyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHBpbmdTY2hlZHVsZSk7XG4gICAgY2xlYXJUaW1lb3V0KGNvbm5lY3RTY2hlZHVsZSk7XG4gICAgZGlzY29ubmVjdCgpO1xuICAgIHdzID0gbnVsbDtcbiAgfTtcblxuICB2YXIgZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3cykge1xuICAgICAgZGVidWcoXCJEaXNjb25uZWN0XCIpO1xuICAgICAgYXV0b1JlY29ubmVjdCA9IGZhbHNlO1xuICAgICAgd3Mub25lcnJvciA9IHdzLm9uY2xvc2UgPSB3cy5vbm9wZW4gPSB3cy5vbm1lc3NhZ2UgPSAkLm5vb3A7XG4gICAgICB3cy5jbG9zZSgpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgb25FcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBvcHRpb25zLmRlYnVnID0gdHJ1ZTtcbiAgICBkZWJ1ZygnZXJyb3I6ICcgKyBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgdHJ5T3RoZXJVcmwgPSB0cnVlO1xuICAgIGNsZWFyVGltZW91dChwaW5nU2NoZWR1bGUpO1xuICB9O1xuXG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbigpIHtcbiAgICBuYkNvbm5lY3RzKys7XG4gICAgaWYgKG5iQ29ubmVjdHMgPT0gMSkge1xuICAgICAgb3B0aW9ucy5vbkZpcnN0Q29ubmVjdCgpO1xuICAgICAgdmFyIGRpc2Nvbm5lY3RUaW1lb3V0O1xuICAgICAgbGljaGVzcy5pZGxlVGltZXIoMTAgKiA2MCAqIDEwMDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICBvcHRpb25zLmlkbGUgPSB0cnVlO1xuICAgICAgICBkaXNjb25uZWN0VGltZW91dCA9IHNldFRpbWVvdXQoZGVzdHJveSwgMiAqIDYwICogNjAgKiAxMDAwKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBvcHRpb25zLmlkbGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHdzKSBjbGVhclRpbWVvdXQoZGlzY29ubmVjdFRpbWVvdXQpO1xuICAgICAgICBlbHNlIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGJhc2VVcmxzID0gZG9jdW1lbnQuYm9keS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29ja2V0LWRvbWFpbnMnKS5zcGxpdCgnLCcpO1xuXG4gIGNvbnN0IGJhc2VVcmwgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgdXJsID0gc3RvcmFnZS5nZXQoKTtcbiAgICBpZiAoIXVybCkge1xuICAgICAgdXJsID0gYmFzZVVybHNbMF07XG4gICAgICBzdG9yYWdlLnNldCh1cmwpO1xuICAgIH0gZWxzZSBpZiAodHJ5T3RoZXJVcmwpIHtcbiAgICAgIHRyeU90aGVyVXJsID0gZmFsc2U7XG4gICAgICB1cmwgPSBiYXNlVXJsc1soYmFzZVVybHMuaW5kZXhPZih1cmwpICsgMSkgJSBiYXNlVXJscy5sZW5ndGhdO1xuICAgICAgc3RvcmFnZS5zZXQodXJsKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbiAgfTtcblxuICBjb25uZWN0KCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmxvYWQnLCBkZXN0cm95KTtcblxuICByZXR1cm4ge1xuICAgIGRpc2Nvbm5lY3Q6IGRpc2Nvbm5lY3QsXG4gICAgc2VuZDogc2VuZCxcbiAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgIHBpbmdJbnRlcnZhbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29tcHV0ZVBpbmdEZWxheSgpICsgYXZlcmFnZUxhZztcbiAgICB9LFxuICAgIGF2ZXJhZ2VMYWc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGF2ZXJhZ2VMYWc7XG4gICAgfSxcbiAgICBnZXRWZXJzaW9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgIH1cbiAgfTtcbn07XG5cbmxpY2hlc3MuU3Ryb25nU29ja2V0LmRlZmF1bHRzID0ge1xuICBldmVudHM6IHtcbiAgICBmZW46IGZ1bmN0aW9uKGUpIHtcbiAgICAgICQoJy5taW5pLWJvYXJkLScgKyBlLmlkKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWNoZXNzLnBhcnNlRmVuKCQodGhpcykuZGF0YShcImZlblwiLCBlLmZlbikuZGF0YShcImxhc3Rtb3ZlXCIsIGUubG0pKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY2hhbGxlbmdlczogZnVuY3Rpb24oZCkge1xuICAgICAgbGljaGVzcy5jaGFsbGVuZ2VBcHAudXBkYXRlKGQpO1xuICAgIH0sXG4gICAgbm90aWZpY2F0aW9uczogZnVuY3Rpb24oZCkge1xuICAgICAgbGljaGVzcy5ub3RpZnlBcHAudXBkYXRlKGQsIHRydWUpO1xuICAgIH1cbiAgfSxcbiAgcGFyYW1zOiB7XG4gICAgc3JpOiBsaWNoZXNzLnNyaVxuICB9LFxuICBvcHRpb25zOiB7XG4gICAgbmFtZTogXCJ1bm5hbWVkXCIsXG4gICAgaWRsZTogZmFsc2UsXG4gICAgcGluZ01heExhZzogOTAwMCwgLy8gdGltZSB0byB3YWl0IGZvciBwb25nIGJlZm9yZSByZXNldGluZyB0aGUgY29ubmVjdGlvblxuICAgIHBpbmdEZWxheTogMjUwMCwgLy8gdGltZSBiZXR3ZWVuIHBvbmcgYW5kIHBpbmdcbiAgICBhdXRvUmVjb25uZWN0RGVsYXk6IDM1MDAsXG4gICAgcHJvdG9jb2w6IGxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICd3c3M6JyA6ICd3czonLFxuICAgIG9uRmlyc3RDb25uZWN0OiAkLm5vb3BcbiAgfVxufTtcbiIsImxpY2hlc3MudHJhbnMgPSBmdW5jdGlvbihpMThuKSB7XG4gIHZhciBmb3JtYXQgPSBmdW5jdGlvbihzdHIsIGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggJiYgc3RyLmluY2x1ZGVzKCckcycpKVxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCA0OyBpKyspXG4gICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCclJyArIGkgKyAnJHMnLCBhcmdzW2kgLSAxXSk7XG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uKGFyZykge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UoJyVzJywgYXJnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RyO1xuICB9O1xuICB2YXIgbGlzdCA9IGZ1bmN0aW9uKHN0ciwgYXJncykge1xuICAgIHZhciBzZWdtZW50cyA9IHN0ci5zcGxpdCgvKCUoPzpcXGRcXCQpP3MpL2cpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwb3MgPSBzZWdtZW50cy5pbmRleE9mKCclJyArIGkgKyAnJHMnKTtcbiAgICAgIGlmIChwb3MgIT09IC0xKSBzZWdtZW50c1twb3NdID0gYXJnc1tpIC0gMV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHBvcyA9IHNlZ21lbnRzLmluZGV4T2YoJyVzJyk7XG4gICAgICBpZiAocG9zID09PSAtMSkgYnJlYWs7XG4gICAgICBzZWdtZW50c1twb3NdID0gYXJnc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHNlZ21lbnRzO1xuICB9O1xuXG4gIHZhciB0cmFucyA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBzdHIgPSBpMThuW2tleV07XG4gICAgcmV0dXJuIHN0ciA/IGZvcm1hdChzdHIsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpIDoga2V5O1xuICB9O1xuICB0cmFucy5wbHVyYWwgPSBmdW5jdGlvbihrZXksIGNvdW50KSB7XG4gICAgdmFyIHBsdXJhbEtleSA9IGtleSArICc6JyArIGxpY2hlc3MucXVhbnRpdHkoY291bnQpO1xuICAgIHZhciBzdHIgPSBpMThuW3BsdXJhbEtleV0gfHwgaTE4bltrZXldO1xuICAgIHJldHVybiBzdHIgPyBmb3JtYXQoc3RyLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSA6IGtleTtcbiAgfTtcbiAgdHJhbnMubm9hcmcgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAvLyBvcHRpbWlzYXRpb24gZm9yIHRyYW5zbGF0aW9ucyB3aXRob3V0IGFyZ3VtZW50c1xuICAgIHJldHVybiBpMThuW2tleV0gfHwga2V5O1xuICB9O1xuICB0cmFucy52ZG9tID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHN0ciA9IGkxOG5ba2V5XTtcbiAgICByZXR1cm4gc3RyID8gbGlzdChzdHIsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpIDogW2tleV07XG4gIH07XG4gIHRyYW5zLnZkb21QbHVyYWwgPSBmdW5jdGlvbihrZXksIGNvdW50KSB7XG4gICAgdmFyIHBsdXJhbEtleSA9IGtleSArICc6JyArIGxpY2hlc3MucXVhbnRpdHkoY291bnQpO1xuICAgIHZhciBzdHIgPSBpMThuW3BsdXJhbEtleV0gfHwgaTE4bltrZXldO1xuICAgIHJldHVybiBzdHIgPyBsaXN0KHN0ciwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSkgOiBba2V5XTtcbiAgfTtcbiAgcmV0dXJuIHRyYW5zO1xufTtcbiIsImxpY2hlc3MgPSB3aW5kb3cubGljaGVzcyB8fCB7fTtcblxubGljaGVzcy5lbmdpbmVOYW1lID0gJ1N0b2NrZmlzaCAxMSsnO1xuXG5saWNoZXNzLnJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpO1xubGljaGVzcy5yZXF1ZXN0SWRsZUNhbGxiYWNrID0gKHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrIHx8IHdpbmRvdy5zZXRUaW1lb3V0KS5iaW5kKHdpbmRvdyk7XG5saWNoZXNzLmRpc3BhdGNoRXZlbnQgPSAoZWwsIGV2ZW50TmFtZSkgPT4gZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoZXZlbnROYW1lKSk7XG5cbmxpY2hlc3MuaGFzVG91Y2hFdmVudHMgPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3c7XG5cbi8vIFVuaXF1ZSBpZCBmb3IgdGhlIGN1cnJlbnQgZG9jdW1lbnQvbmF2aWdhdGlvbi4gU2hvdWxkIGJlIGRpZmZlcmVudCBhZnRlclxuLy8gZWFjaCBwYWdlIGxvYWQgYW5kIGZvciBlYWNoIHRhYi4gU2hvdWxkIGJlIHVucHJlZGljdGFibGUgYW5kIHNlY3JldCB3aGlsZVxuLy8gaW4gdXNlLlxudHJ5IHtcbiAgY29uc3QgZGF0YSA9IHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDkpKTtcbiAgbGljaGVzcy5zcmkgPSBidG9hKFN0cmluZy5mcm9tQ2hhckNvZGUoLi4uZGF0YSkpLnJlcGxhY2UoL1svK10vZywgJ18nKTtcbn0gY2F0Y2goXykge1xuICBsaWNoZXNzLnNyaSA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDEyKTtcbn1cblxubGljaGVzcy5pc0NvbDEgPSAoKCkgPT4ge1xuICBsZXQgaXNDb2wxQ2FjaGUgPSAnaW5pdCc7IC8vICdpbml0JyB8ICdyZWMnIHwgYm9vbGVhblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgaXNDb2wxQ2FjaGUgPT0gJ3N0cmluZycpIHtcbiAgICAgIGlmIChpc0NvbDFDYWNoZSA9PSAnaW5pdCcpIHsgLy8gb25seSBvbmNlXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7IGlzQ29sMUNhY2hlID0gJ3JlYycgfSk7IC8vIHJlY29tcHV0ZSBvbiByZXNpemVcbiAgICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRWRnZS8nKSA+IC0xKSAvLyBlZGdlIGdldHMgZmFsc2UgcG9zaXRpdmUgb24gcGFnZSBsb2FkLCBmaXggbGF0ZXJcbiAgICAgICAgICB3aW5kb3cubGljaGVzcy5yYWYoKCkgPT4geyBpc0NvbDFDYWNoZSA9ICdyZWMnIH0pO1xuICAgICAgfVxuICAgICAgaXNDb2wxQ2FjaGUgPSAhIWdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZ2V0UHJvcGVydHlWYWx1ZSgnLS1jb2wxJyk7XG4gICAgfVxuICAgIHJldHVybiBpc0NvbDFDYWNoZTtcbiAgfTtcbn0pKCk7XG5cbntcbiAgY29uc3QgYnVpbGRTdG9yYWdlID0gKHN0b3JhZ2UpID0+IHtcbiAgICBjb25zdCBhcGkgPSB7XG4gICAgICBnZXQ6IGsgPT4gc3RvcmFnZS5nZXRJdGVtKGspLFxuICAgICAgc2V0OiAoaywgdikgPT4gc3RvcmFnZS5zZXRJdGVtKGssIHYpLFxuICAgICAgZmlyZTogKGssIHYpID0+IHN0b3JhZ2Uuc2V0SXRlbShrLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNyaTogbGljaGVzcy5zcmksXG4gICAgICAgIG5vbmNlOiBNYXRoLnJhbmRvbSgpLCAvLyBlbnN1cmUgaXRlbSBjaGFuZ2VzXG4gICAgICAgIHZhbHVlOiB2XG4gICAgICB9KSksXG4gICAgICByZW1vdmU6IGsgPT4gc3RvcmFnZS5yZW1vdmVJdGVtKGspLFxuICAgICAgbWFrZTogayA9PiAoe1xuICAgICAgICBnZXQ6ICgpID0+IGFwaS5nZXQoayksXG4gICAgICAgIHNldDogdiA9PiBhcGkuc2V0KGssIHYpLFxuICAgICAgICBmaXJlOiB2ID0+IGFwaS5maXJlKGssIHYpLFxuICAgICAgICByZW1vdmU6ICgpID0+IGFwaS5yZW1vdmUoayksXG4gICAgICAgIGxpc3RlbjogZiA9PiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIGUgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSAhPT0gayB8fCBlLnN0b3JhZ2VBcmVhICE9PSBzdG9yYWdlIHx8IGUubmV3VmFsdWUgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICBsZXQgcGFyc2VkO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKGUubmV3VmFsdWUpO1xuICAgICAgICAgIH0gY2F0Y2goXykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjaGVjayBzcmksIGJlY2F1c2UgU2FmYXJpIGZpcmVzIGV2ZW50cyBhbHNvIGluIHRoZSBvcmlnaW5hbFxuICAgICAgICAgIC8vIGRvY3VtZW50IHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIHRhYnNcbiAgICAgICAgICBpZiAocGFyc2VkLnNyaSAmJiBwYXJzZWQuc3JpICE9PSBsaWNoZXNzLnNyaSkgZihwYXJzZWQpO1xuICAgICAgICB9KVxuICAgICAgfSksXG4gICAgICBtYWtlQm9vbGVhbjogayA9PiAoe1xuICAgICAgICBnZXQ6ICgpID0+IGFwaS5nZXQoaykgPT0gMSxcbiAgICAgICAgc2V0OiB2ID0+IGFwaS5zZXQoaywgdiA/IDEgOiAwKSxcbiAgICAgICAgdG9nZ2xlOiAoKSA9PiBhcGkuc2V0KGssIGFwaS5nZXQoaykgPT0gMSA/IDAgOiAxKVxuICAgICAgfSlcbiAgICB9O1xuICAgIHJldHVybiBhcGk7XG4gIH07XG5cblxuICBsaWNoZXNzLnN0b3JhZ2UgPSBidWlsZFN0b3JhZ2Uod2luZG93LmxvY2FsU3RvcmFnZSk7XG4gIGxpY2hlc3MudGVtcFN0b3JhZ2UgPSBidWlsZFN0b3JhZ2Uod2luZG93LnNlc3Npb25TdG9yYWdlKTtcbn1cblxubGljaGVzcy5vbmNlID0gKGtleSwgbW9kKSA9PiB7XG4gIGlmIChtb2QgPT09ICdhbHdheXMnKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKCFsaWNoZXNzLnN0b3JhZ2UuZ2V0KGtleSkpIHtcbiAgICBsaWNoZXNzLnN0b3JhZ2Uuc2V0KGtleSwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcbmxpY2hlc3MuZGVib3VuY2UgPSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSA9PiB7XG4gIGxldCB0aW1lb3V0LCBsYXN0Qm91bmNlID0gMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250ZXh0ID0gdGhpcyxcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICBlbGFwc2VkID0gcGVyZm9ybWFuY2Uubm93KCkgLSBsYXN0Qm91bmNlO1xuICAgIGxhc3RCb3VuY2UgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBsZXQgbGF0ZXIgPSAoKSA9PiB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgaWYgKGltbWVkaWF0ZSAmJiBlbGFwc2VkID4gd2FpdCkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICBlbHNlIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgfTtcbn07XG5saWNoZXNzLnBvd2VydGlwID0gKCgpID0+IHtcblxuICBmdW5jdGlvbiBjb250YWluZWRJbihlbCwgY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lciAmJiBjb250YWluZXIuY29udGFpbnMoZWwpO1xuICB9XG4gIGZ1bmN0aW9uIGluQ3Jvc3N0YWJsZShlbCkge1xuICAgIHJldHVybiBjb250YWluZWRJbihlbCwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNyb3NzdGFibGUnKSk7XG4gIH1cblxuICBmdW5jdGlvbiBvblBvd2VydGlwUHJlUmVuZGVyKGlkLCBwcmVsb2FkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHVybCA9ICgkKHRoaXMpLmRhdGEoJ2hyZWYnKSB8fCAkKHRoaXMpLmF0dHIoJ2hyZWYnKSkucmVwbGFjZSgvXFw/LiskLywgJycpO1xuICAgICAgaWYgKHByZWxvYWQpIHByZWxvYWQodXJsKTtcbiAgICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsICsgJy9taW5pJyxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oaHRtbCkge1xuICAgICAgICAgICQoJyMnICsgaWQpLmh0bWwoaHRtbCk7XG4gICAgICAgICAgbGljaGVzcy5wdWJzdWIuZW1pdCgnY29udGVudF9sb2FkZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcblxuICBsZXQgdXB0QSA9ICh1cmwsIGljb24pID0+ICc8YSBjbGFzcz1cImJ0bi1yYWNrX19idG5cIiBocmVmPVwiJyArIHVybCArICdcIiBkYXRhLWljb249XCInICsgaWNvbiArICdcIj48L2E+JztcblxuICBsZXQgdXNlclBvd2VydGlwID0gKGVsLCBwb3MpID0+IHtcbiAgICBwb3MgPSBwb3MgfHwgZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXB0LXBvcycpIHx8IChcbiAgICAgIGluQ3Jvc3N0YWJsZShlbCkgPyAnbicgOiAncydcbiAgICApO1xuICAgICQoZWwpLnJlbW92ZUNsYXNzKCd1bHB0JykucG93ZXJUaXAoe1xuICAgICAgaW50ZW50UG9sbEludGVydmFsOiAyMDAsXG4gICAgICBwbGFjZW1lbnQ6IHBvcyxcbiAgICAgIHNtYXJ0UGxhY2VtZW50OiB0cnVlLFxuICAgICAgbW91c2VPblRvUG9wdXA6IHRydWUsXG4gICAgICBjbG9zZURlbGF5OiAyMDBcbiAgICB9KS5kYXRhKCdwb3dlcnRpcCcsICcgJykub24oe1xuICAgICAgcG93ZXJUaXBSZW5kZXI6IG9uUG93ZXJ0aXBQcmVSZW5kZXIoJ3Bvd2VyVGlwJywgKHVybCkgPT4ge1xuICAgICAgICBjb25zdCB1ID0gdXJsLnN1YnN0cigzKTtcbiAgICAgICAgY29uc3QgbmFtZSA9ICQoZWwpLmRhdGEoJ25hbWUnKSB8fCAkKGVsKS5odG1sKCk7XG4gICAgICAgICQoJyNwb3dlclRpcCcpLmh0bWwoJzxkaXYgY2xhc3M9XCJ1cHRfX2luZm9cIj48ZGl2IGNsYXNzPVwidXB0X19pbmZvX190b3BcIj48c3BhbiBjbGFzcz1cInVzZXItbGluayBvZmZsaW5lXCI+JyArIG5hbWUgKyAnPC9zcGFuPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJ1cHRfX2FjdGlvbnMgYnRuLXJhY2tcIj4nICtcbiAgICAgICAgICB1cHRBKCcvQC8nICsgdSArICcvdHYnLCAnMScpICtcbiAgICAgICAgICB1cHRBKCcvaW5ib3gvbmV3P3VzZXI9JyArIHUsICdjJykgK1xuICAgICAgICAgIHVwdEEoJy8/dXNlcj0nICsgdSArICcjZnJpZW5kJywgJ1UnKSArXG4gICAgICAgICAgJzxhIGNsYXNzPVwiYnRuLXJhY2tfX2J0biByZWxhdGlvbi1idXR0b25cIiBkaXNhYmxlZD48L2E+PC9kaXY+Jyk7XG4gICAgICB9KVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdhbWVQb3dlcnRpcChlbCkge1xuICAgICQoZWwpLnJlbW92ZUNsYXNzKCdnbHB0JykucG93ZXJUaXAoe1xuICAgICAgaW50ZW50UG9sbEludGVydmFsOiAyMDAsXG4gICAgICBwbGFjZW1lbnQ6IGluQ3Jvc3N0YWJsZShlbCkgPyAnbicgOiAndycsXG4gICAgICBzbWFydFBsYWNlbWVudDogdHJ1ZSxcbiAgICAgIG1vdXNlT25Ub1BvcHVwOiB0cnVlLFxuICAgICAgY2xvc2VEZWxheTogMjAwLFxuICAgICAgcG9wdXBJZDogJ21pbmlHYW1lJ1xuICAgIH0pLm9uKHtcbiAgICAgIHBvd2VyVGlwUHJlUmVuZGVyOiBvblBvd2VydGlwUHJlUmVuZGVyKCdtaW5pR2FtZScpXG4gICAgfSkuZGF0YSgncG93ZXJ0aXAnLCBsaWNoZXNzLnNwaW5uZXJIdG1sKTtcbiAgfTtcblxuICBmdW5jdGlvbiBwb3dlclRpcFdpdGgoZWwsIGV2LCBmKSB7XG4gICAgaWYgKGxpY2hlc3MuaXNIb3ZlcmFibGUoKSkge1xuICAgICAgZihlbCk7XG4gICAgICAkLnBvd2VyVGlwLnNob3coZWwsIGV2KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gb25JZGxlRm9yQWxsKHBhciwgc2VsLCBmdW4pIHtcbiAgICBsaWNoZXNzLnJlcXVlc3RJZGxlQ2FsbGJhY2soZnVuY3Rpb24oKSB7XG4gICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHBhci5xdWVyeVNlbGVjdG9yQWxsKHNlbCksIGZ1bik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG1vdXNlb3ZlcihlKSB7XG4gICAgICB2YXIgdCA9IGUudGFyZ2V0LFxuICAgICAgICBjbCA9IHQuY2xhc3NMaXN0O1xuICAgICAgaWYgKGNsLmNvbnRhaW5zKCd1bHB0JykpIHBvd2VyVGlwV2l0aCh0LCBlLCB1c2VyUG93ZXJ0aXApO1xuICAgICAgZWxzZSBpZiAoY2wuY29udGFpbnMoJ2dscHQnKSkgcG93ZXJUaXBXaXRoKHQsIGUsIGdhbWVQb3dlcnRpcCk7XG4gICAgfSxcbiAgICBtYW51YWxHYW1lSW4ocGFyZW50KSB7XG4gICAgICBvbklkbGVGb3JBbGwocGFyZW50LCAnLmdscHQnLCBnYW1lUG93ZXJ0aXApO1xuICAgIH0sXG4gICAgbWFudWFsVXNlckluKHBhcmVudCkge1xuICAgICAgb25JZGxlRm9yQWxsKHBhcmVudCwgJy51bHB0JywgKGVsKSA9PiB1c2VyUG93ZXJ0aXAoZWwpKTtcbiAgICB9XG4gIH07XG59KSgpO1xubGljaGVzcy53aWRnZXQgPSAobmFtZSwgcHJvdG90eXBlKSA9PiB7XG4gIHZhciBjb25zdHJ1Y3RvciA9ICRbbmFtZV0gPSBmdW5jdGlvbihvcHRpb25zLCBlbGVtZW50KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAkLmRhdGEoZWxlbWVudCwgbmFtZSwgdGhpcyk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl9jcmVhdGUoKTtcbiAgfTtcbiAgY29uc3RydWN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAkLmZuW25hbWVdID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIHJldHVyblZhbHVlID0gdGhpcztcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdzdHJpbmcnKSB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSAkLmRhdGEodGhpcywgbmFtZSk7XG4gICAgICBpZiAoIWluc3RhbmNlKSByZXR1cm47XG4gICAgICBpZiAoISQuaXNGdW5jdGlvbihpbnN0YW5jZVttZXRob2RdKSB8fCBtZXRob2QuY2hhckF0KDApID09PSBcIl9cIilcbiAgICAgICAgcmV0dXJuICQuZXJyb3IoXCJubyBzdWNoIG1ldGhvZCAnXCIgKyBtZXRob2QgKyBcIicgZm9yIFwiICsgbmFtZSArIFwiIHdpZGdldCBpbnN0YW5jZVwiKTtcbiAgICAgIHJldHVyblZhbHVlID0gaW5zdGFuY2VbbWV0aG9kXS5hcHBseShpbnN0YW5jZSwgYXJncyk7XG4gICAgfSk7XG4gICAgZWxzZSB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISQuZGF0YSh0aGlzLCBuYW1lKSkgJC5kYXRhKHRoaXMsIG5hbWUsIG5ldyBjb25zdHJ1Y3RvcihtZXRob2QsIHRoaXMpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH07XG59O1xubGljaGVzcy5pc0hvdmVyYWJsZSA9ICgpID0+IHtcbiAgaWYgKHR5cGVvZiBsaWNoZXNzLmhvdmVyYWJsZSA9PT0gJ3VuZGVmaW5lZCcpXG4gICAgbGljaGVzcy5ob3ZlcmFibGUgPSAhbGljaGVzcy5oYXNUb3VjaEV2ZW50cyAvKiBGaXJlZm94IDw9IDYzICovIHx8ICEhZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5ib2R5KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWhvdmVyYWJsZScpO1xuICByZXR1cm4gbGljaGVzcy5ob3ZlcmFibGU7XG59O1xubGljaGVzcy5zcGlubmVySHRtbCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjxzdmcgdmlld0JveD1cIjAgMCA0MCA0MFwiPjxjaXJjbGUgY3g9MjAgY3k9MjAgcj0xOCBmaWxsPVwibm9uZVwiPjwvY2lyY2xlPjwvc3ZnPjwvZGl2Pic7XG5saWNoZXNzLmFzc2V0VXJsID0gKHBhdGgsIG9wdHMpID0+IHtcbiAgb3B0cyA9IG9wdHMgfHwge307XG4gIGNvbnN0IGJhc2VVcmwgPSBvcHRzLnNhbWVEb21haW4gPyAnJyA6IGRvY3VtZW50LmJvZHkuZ2V0QXR0cmlidXRlKCdkYXRhLWFzc2V0LXVybCcpLFxuICAgIHZlcnNpb24gPSBkb2N1bWVudC5ib2R5LmdldEF0dHJpYnV0ZSgnZGF0YS1hc3NldC12ZXJzaW9uJyk7XG4gIHJldHVybiBiYXNlVXJsICsgJy9hc3NldHMnICsgKG9wdHMubm9WZXJzaW9uID8gJycgOiAnL18nICsgdmVyc2lvbikgKyAnLycgKyBwYXRoO1xufTtcbmxpY2hlc3MubG9hZGVkQ3NzID0ge307XG5saWNoZXNzLmxvYWRDc3MgPSBmdW5jdGlvbih1cmwpIHtcbiAgaWYgKGxpY2hlc3MubG9hZGVkQ3NzW3VybF0pIHJldHVybjtcbiAgbGljaGVzcy5sb2FkZWRDc3NbdXJsXSA9IHRydWU7XG4gICQoJ2hlYWQnKS5hcHBlbmQoJCgnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIHR5cGU9XCJ0ZXh0L2Nzc1wiIC8+JykuYXR0cignaHJlZicsIGxpY2hlc3MuYXNzZXRVcmwodXJsKSkpO1xufTtcbmxpY2hlc3MubG9hZENzc1BhdGggPSBmdW5jdGlvbihrZXkpIHtcbiAgbGljaGVzcy5sb2FkQ3NzKCdjc3MvJyArIGtleSArICcuJyArICQoJ2JvZHknKS5kYXRhKCd0aGVtZScpICsgJy4nICsgKCQoJ2JvZHknKS5kYXRhKCdkZXYnKSA/ICdkZXYnIDogJ21pbicpICsgJy5jc3MnKTtcbn1cbmxpY2hlc3MuY29tcGlsZWRTY3JpcHQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiAnY29tcGlsZWQvbGljaGVzcy4nICsgbmFtZSArICgkKCdib2R5JykuZGF0YSgnZGV2JykgPyAnJyA6ICcubWluJykgKyAnLmpzJztcbn1cbmxpY2hlc3MubG9hZFNjcmlwdCA9IGZ1bmN0aW9uKHVybCwgb3B0cykge1xuICByZXR1cm4gJC5hamF4KHtcbiAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcbiAgICBjYWNoZTogdHJ1ZSxcbiAgICB1cmw6IGxpY2hlc3MuYXNzZXRVcmwodXJsLCBvcHRzKVxuICB9KTtcbn07XG5saWNoZXNzLmhvcHNjb3RjaCA9IGZ1bmN0aW9uKGYpIHtcbiAgbGljaGVzcy5sb2FkQ3NzKCd2ZW5kb3IvaG9wc2NvdGNoL2Rpc3QvY3NzL2hvcHNjb3RjaC5taW4uY3NzJyk7XG4gIGxpY2hlc3MubG9hZFNjcmlwdCgndmVuZG9yL2hvcHNjb3RjaC9kaXN0L2pzL2hvcHNjb3RjaC5taW4uanMnLCB7bm9WZXJzaW9uOnRydWV9KS5kb25lKGYpO1xufVxubGljaGVzcy5zbGlkZXIgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGxpY2hlc3MubG9hZFNjcmlwdChcbiAgICAnamF2YXNjcmlwdHMvdmVuZG9yL2pxdWVyeS11aS5zbGlkZXInICsgKGxpY2hlc3MuaGFzVG91Y2hFdmVudHMgPyAnLnRvdWNoJyA6ICcnKSArICcubWluLmpzJ1xuICApO1xufTtcbmxpY2hlc3MubWFrZUNoYXQgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICBsaWNoZXNzLnJhZihmdW5jdGlvbigpIHtcbiAgICBkYXRhLmxvYWRDc3MgPSBsaWNoZXNzLmxvYWRDc3NQYXRoO1xuICAgIChjYWxsYmFjayB8fCAkLm5vb3ApKExpY2hlc3NDaGF0LmRlZmF1bHQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1jaGF0JyksIGRhdGEpKTtcbiAgfSk7XG59O1xubGljaGVzcy5mb3JtQWpheCA9ICRmb3JtID0+ICh7XG4gIHVybDogJGZvcm0uYXR0cignYWN0aW9uJyksXG4gIG1ldGhvZDogJGZvcm0uYXR0cignbWV0aG9kJykgfHwgJ3Bvc3QnLFxuICBkYXRhOiAkZm9ybS5zZXJpYWxpemUoKVxufSk7XG5cbmxpY2hlc3MubnVtYmVyRm9ybWF0ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgZm9ybWF0dGVyID0gZmFsc2U7XG4gIHJldHVybiBmdW5jdGlvbihuKSB7XG4gICAgaWYgKGZvcm1hdHRlciA9PT0gZmFsc2UpIGZvcm1hdHRlciA9ICh3aW5kb3cuSW50bCAmJiBJbnRsLk51bWJlckZvcm1hdCkgPyBuZXcgSW50bC5OdW1iZXJGb3JtYXQoKSA6IG51bGw7XG4gICAgaWYgKGZvcm1hdHRlciA9PT0gbnVsbCkgcmV0dXJuIG47XG4gICAgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQobik7XG4gIH07XG59KSgpO1xubGljaGVzcy5pZGxlVGltZXIgPSBmdW5jdGlvbihkZWxheSwgb25JZGxlLCBvbldha2VVcCkge1xuICB2YXIgZXZlbnRzID0gWydtb3VzZW1vdmUnLCAndG91Y2hzdGFydCddO1xuICB2YXIgbGlzdGVuaW5nID0gZmFsc2U7XG4gIHZhciBhY3RpdmUgPSB0cnVlO1xuICB2YXIgbGFzdFNlZW5BY3RpdmUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgdmFyIG9uQWN0aXZpdHkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWFjdGl2ZSkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ1dha2UgdXAnKTtcbiAgICAgIG9uV2FrZVVwKCk7XG4gICAgfVxuICAgIGFjdGl2ZSA9IHRydWU7XG4gICAgbGFzdFNlZW5BY3RpdmUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBzdG9wTGlzdGVuaW5nKCk7XG4gIH07XG4gIHZhciBzdGFydExpc3RlbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghbGlzdGVuaW5nKSB7XG4gICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZSwgb25BY3Rpdml0eSk7XG4gICAgICB9KTtcbiAgICAgIGxpc3RlbmluZyA9IHRydWU7XG4gICAgfVxuICB9O1xuICB2YXIgc3RvcExpc3RlbmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChsaXN0ZW5pbmcpIHtcbiAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBvbkFjdGl2aXR5KTtcbiAgICAgIH0pO1xuICAgICAgbGlzdGVuaW5nID0gZmFsc2U7XG4gICAgfVxuICB9O1xuICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAoYWN0aXZlICYmIHBlcmZvcm1hbmNlLm5vdygpIC0gbGFzdFNlZW5BY3RpdmUgPiBkZWxheSkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ0lkbGUgbW9kZScpO1xuICAgICAgb25JZGxlKCk7XG4gICAgICBhY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgc3RhcnRMaXN0ZW5pbmcoKTtcbiAgfSwgMTAwMDApO1xufTtcbmxpY2hlc3MucHVic3ViID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgc3VicyA9IFtdO1xuICByZXR1cm4ge1xuICAgIG9uKG5hbWUsIGNiKSB7XG4gICAgICBzdWJzW25hbWVdID0gc3Vic1tuYW1lXSB8fCBbXTtcbiAgICAgIHN1YnNbbmFtZV0ucHVzaChjYik7XG4gICAgfSxcbiAgICBvZmYobmFtZSwgY2IpIHtcbiAgICAgIGlmICghc3Vic1tuYW1lXSkgcmV0dXJuO1xuICAgICAgZm9yICh2YXIgaSBpbiBzdWJzW25hbWVdKSB7XG4gICAgICAgIGlmIChzdWJzW25hbWVdW2ldID09PSBjYikge1xuICAgICAgICAgIHN1YnNbbmFtZV0uc3BsaWNlKGkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBlbWl0KG5hbWUgLyosIGFyZ3MuLi4gKi8pIHtcbiAgICAgIGlmICghc3Vic1tuYW1lXSkgcmV0dXJuO1xuICAgICAgY29uc3QgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICBmb3IgKGxldCBpIGluIHN1YnNbbmFtZV0pIHN1YnNbbmFtZV1baV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICB9O1xufSkoKTtcbmxpY2hlc3MuaGFzVG9SZWxvYWQgPSBmYWxzZTtcbmxpY2hlc3MucmVkaXJlY3RJblByb2dyZXNzID0gZmFsc2U7XG5saWNoZXNzLnJlZGlyZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciB1cmw7XG4gIGlmICh0eXBlb2Ygb2JqID09IFwic3RyaW5nXCIpIHVybCA9IG9iajtcbiAgZWxzZSB7XG4gICAgdXJsID0gb2JqLnVybDtcbiAgICBpZiAob2JqLmNvb2tpZSkge1xuICAgICAgdmFyIGRvbWFpbiA9IGRvY3VtZW50LmRvbWFpbi5yZXBsYWNlKC9eLisoXFwuW14uXStcXC5bXi5dKykkLywgJyQxJyk7XG4gICAgICB2YXIgY29va2llID0gW1xuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQob2JqLmNvb2tpZS5uYW1lKSArICc9JyArIG9iai5jb29raWUudmFsdWUsXG4gICAgICAgICc7IG1heC1hZ2U9JyArIG9iai5jb29raWUubWF4QWdlLFxuICAgICAgICAnOyBwYXRoPS8nLFxuICAgICAgICAnOyBkb21haW49JyArIGRvbWFpblxuICAgICAgXS5qb2luKCcnKTtcbiAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZTtcbiAgICB9XG4gIH1cbiAgdmFyIGhyZWYgPSAnLy8nICsgbG9jYXRpb24uaG9zdCArICcvJyArIHVybC5yZXBsYWNlKC9eXFwvLywgJycpO1xuICBsaWNoZXNzLnJlZGlyZWN0SW5Qcm9ncmVzcyA9IGhyZWY7XG4gIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xufTtcbmxpY2hlc3MucmVsb2FkID0gZnVuY3Rpb24oKSB7XG4gIGlmIChsaWNoZXNzLnJlZGlyZWN0SW5Qcm9ncmVzcykgcmV0dXJuO1xuICBsaWNoZXNzLmhhc1RvUmVsb2FkID0gdHJ1ZTtcbiAgaWYgKGxvY2F0aW9uLmhhc2gpIGxvY2F0aW9uLnJlbG9hZCgpO1xuICBlbHNlIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xufTtcbmxpY2hlc3MuZXNjYXBlSHRtbCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gL1smPD5cIiddLy50ZXN0KHN0cikgP1xuICAgIHN0clxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvJy9nLCAnJiMzOTsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykgOlxuICAgIHN0cjtcbn07XG4kLm1vZGFsID0gZnVuY3Rpb24oaHRtbCwgY2xzLCBvbkNsb3NlKSB7XG4gICQubW9kYWwuY2xvc2UoKTtcbiAgaWYgKCFodG1sLmNsb25lKSBodG1sID0gJCgnPGRpdj4nICsgaHRtbCArICc8L2Rpdj4nKTtcbiAgdmFyICR3cmFwID0gJCgnPGRpdiBpZD1cIm1vZGFsLXdyYXBcIj4nKVxuICAgIC5odG1sKGh0bWwuY2xvbmUoKS5yZW1vdmVDbGFzcygnbm9uZScpKVxuICAgIC5wcmVwZW5kKCc8c3BhbiBjbGFzcz1cImNsb3NlXCIgZGF0YS1pY29uPVwiTFwiPjwvc3Bhbj4nKTtcbiAgdmFyICRvdmVybGF5ID0gJCgnPGRpdiBpZD1cIm1vZGFsLW92ZXJsYXlcIj4nKVxuICAgIC5hZGRDbGFzcyhjbHMpXG4gICAgLmRhdGEoJ29uQ2xvc2UnLCBvbkNsb3NlKVxuICAgIC5odG1sKCR3cmFwKTtcbiAgJHdyYXAuZmluZCgnLmNsb3NlJykub24oJ2NsaWNrJywgJC5tb2RhbC5jbG9zZSk7XG4gICRvdmVybGF5Lm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIC8vIGRpc2d1c3RpbmcgaGFja1xuICAgIC8vIGRyYWdnaW5nIHNsaWRlciBvdXQgb2YgYSBtb2RhbCBjbG9zZXMgdGhlIG1vZGFsXG4gICAgaWYgKCEkKCcudWktc2xpZGVyLWhhbmRsZS51aS1zdGF0ZS1mb2N1cycpLmxlbmd0aCkgJC5tb2RhbC5jbG9zZSgpO1xuICB9KTtcbiAgJHdyYXAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICAkKCdib2R5JykuYWRkQ2xhc3MoJ292ZXJsYXllZCcpLnByZXBlbmQoJG92ZXJsYXkpO1xuICByZXR1cm4gJHdyYXA7XG59O1xuJC5tb2RhbC5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ292ZXJsYXllZCcpO1xuICAkKCcjbW9kYWwtb3ZlcmxheScpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgKCQodGhpcykuZGF0YSgnb25DbG9zZScpIHx8ICQubm9vcCkoKTtcbiAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICB9KTtcbn07XG4iLCIvKiogYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2h1c3RjYy90aW1lYWdvLmpzIENvcHlyaWdodCAoYykgMjAxNiBodXN0Y2MgTGljZW5zZTogTUlUICoqL1xubGljaGVzcy50aW1lYWdvID0gKGZ1bmN0aW9uKCkge1xuXG5cbiAgLy8gZGl2aXNvcnMgZm9yIG1pbnV0ZXMsIGhvdXJzLCBkYXlzLCB3ZWVrcywgbW9udGhzLCB5ZWFyc1xuICBjb25zdCBESVZTID0gWzYwLFxuICAgICAgICAgICAgICAgIDYwICogNjAsXG4gICAgICAgICAgICAgICAgNjAgKiA2MCAqIDI0LFxuICAgICAgICAgICAgICAgIDYwICogNjAgKiAyNCAqIDcsXG4gICAgICAgICAgICAgICAgNjAgKiA2MCAqIDIgKiAzNjUsIC8vIDI0LzEyID0gMlxuICAgICAgICAgICAgICAgIDYwICogNjAgKiAyNCAqIDM2NV07XG5cbiAgY29uc3QgTElNSVRTID0gWy4uLkRJVlNdO1xuICBMSU1JVFNbMl0gKj0gMjsgLy8gU2hvdyBob3VycyB1cCB0byAyIGRheXMuXG5cbiAgLy8gZm9ybWF0IERhdGUgLyBzdHJpbmcgLyB0aW1lc3RhbXAgdG8gRGF0ZSBpbnN0YW5jZS5cbiAgZnVuY3Rpb24gdG9EYXRlKGlucHV0KSB7XG4gICAgcmV0dXJuIGlucHV0IGluc3RhbmNlb2YgRGF0ZSA/IGlucHV0IDogKFxuICAgICAgbmV3IERhdGUoaXNOYU4oaW5wdXQpID8gaW5wdXQgOiBwYXJzZUludChpbnB1dCkpXG4gICAgKTtcbiAgfVxuXG4gIC8vIGZvcm1hdCB0aGUgZGlmZiBzZWNvbmQgdG8gKioqIHRpbWUgYWdvXG4gIGZ1bmN0aW9uIGZvcm1hdERpZmYoZGlmZikge1xuICAgIGxldCBhZ29pbiA9IDA7XG4gICAgaWYgKGRpZmYgPCAwKSB7XG4gICAgICBhZ29pbiA9IDE7XG4gICAgICBkaWZmID0gLWRpZmY7XG4gICAgfVxuICAgIHZhciB0b3RhbF9zZWMgPSBkaWZmO1xuXG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoO2kgPCA2ICYmIGRpZmYgPj0gTElNSVRTW2ldOyBpKyspO1xuICAgIGlmIChpID4gMCkgZGlmZiAvPSBESVZTW2ktMV07XG5cbiAgICBkaWZmID0gTWF0aC5mbG9vcihkaWZmKTtcbiAgICBpICo9IDI7XG5cbiAgICBpZiAoZGlmZiA+IChpID09PSAwID8gOSA6IDEpKSBpICs9IDE7XG4gICAgcmV0dXJuIGxpY2hlc3MudGltZWFnb0xvY2FsZShkaWZmLCBpLCB0b3RhbF9zZWMpW2Fnb2luXS5yZXBsYWNlKCclcycsIGRpZmYpO1xuICB9XG5cbiAgdmFyIGZvcm1hdHRlckluc3Q7XG5cbiAgZnVuY3Rpb24gZm9ybWF0dGVyKCkge1xuICAgIHJldHVybiBmb3JtYXR0ZXJJbnN0ID0gZm9ybWF0dGVySW5zdCB8fCAod2luZG93LkludGwgJiYgSW50bC5EYXRlVGltZUZvcm1hdCA/XG4gICAgICBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubGFuZywge1xuICAgICAgICB5ZWFyOiAnbnVtZXJpYycsXG4gICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICBkYXk6ICdudW1lcmljJyxcbiAgICAgICAgaG91cjogJ251bWVyaWMnLFxuICAgICAgICBtaW51dGU6ICdudW1lcmljJ1xuICAgICAgfSkuZm9ybWF0IDogZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50b0xvY2FsZVN0cmluZygpOyB9KVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKG5vZGVzKSB7XG4gICAgICB2YXIgY2wsIGFicywgc2V0LCBzdHIsIGRpZmYsIG5vdyA9IERhdGUubm93KCk7XG4gICAgICBub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgY2wgPSBub2RlLmNsYXNzTGlzdCxcbiAgICAgICAgYWJzID0gY2wuY29udGFpbnMoJ2FicycpLFxuICAgICAgICBzZXQgPSBjbC5jb250YWlucygnc2V0Jyk7XG4gICAgICAgIG5vZGUuZGF0ZSA9IG5vZGUuZGF0ZSB8fCB0b0RhdGUobm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGV0aW1lJykpO1xuICAgICAgICBpZiAoIXNldCkge1xuICAgICAgICAgIHN0ciA9IGZvcm1hdHRlcigpKG5vZGUuZGF0ZSk7XG4gICAgICAgICAgaWYgKGFicykgbm9kZS50ZXh0Q29udGVudCA9IHN0cjtcbiAgICAgICAgICBlbHNlIG5vZGUuc2V0QXR0cmlidXRlKCd0aXRsZScsIHN0cik7XG4gICAgICAgICAgY2wuYWRkKCdzZXQnKTtcbiAgICAgICAgICBpZiAoYWJzIHx8IGNsLmNvbnRhaW5zKCdvbmNlJykpIGNsLnJlbW92ZSgndGltZWFnbycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYWJzKSB7XG4gICAgICAgICAgZGlmZiA9IChub3cgLSBub2RlLmRhdGUpIC8gMTAwMDtcbiAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gZm9ybWF0RGlmZihkaWZmKTtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiA5OTk5KSBjbC5yZW1vdmUoJ3RpbWVhZ28nKTsgLy8gfjNoXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8gcmVsYXRpdmVcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHJldHVybiBmb3JtYXREaWZmKChEYXRlLm5vdygpIC0gdG9EYXRlKGRhdGUpKSAvIDEwMDApO1xuICAgIH0sXG4gICAgYWJzb2x1dGU6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgIHJldHVybiBmb3JtYXR0ZXIoKSh0b0RhdGUoZGF0ZSkpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG4iXX0=
