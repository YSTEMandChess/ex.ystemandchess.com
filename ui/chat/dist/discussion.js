"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snabbdom_1 = require("snabbdom");
const spam = require("./spam");
const enhance = require("./enhance");
const preset_1 = require("./preset");
const moderation_1 = require("./moderation");
const util_1 = require("./util");
const xhr_1 = require("./xhr");
const whisperRegex = /^\/w(?:hisper)?\s/;
function default_1(ctrl) {
    if (!ctrl.vm.enabled)
        return [];
    const scrollCb = (vnode) => {
        const el = vnode.elm;
        if (ctrl.data.lines.length > 5) {
            const autoScroll = (el.scrollTop === 0 || (el.scrollTop > (el.scrollHeight - el.clientHeight - 100)));
            if (autoScroll) {
                el.scrollTop = 999999;
                setTimeout((_) => el.scrollTop = 999999, 300);
            }
        }
    }, mod = ctrl.moderation();
    const vnodes = [
        snabbdom_1.h('ol.mchat__messages.chat-v-' + ctrl.data.domVersion, {
            attrs: {
                role: 'log',
                'aria-live': 'polite',
                'aria-atomic': false
            },
            hook: {
                insert(vnode) {
                    const $el = $(vnode.elm).on('click', 'a.jump', (e) => {
                        window.lichess.pubsub.emit('jump', e.target.getAttribute('data-ply'));
                    });
                    if (mod)
                        $el.on('click', '.mod', (e) => {
                            mod.open(e.target.getAttribute('data-username').split(' ')[0]);
                        });
                    else
                        $el.on('click', '.flag', (e) => report(ctrl, e.target.parentNode));
                    scrollCb(vnode);
                },
                postpatch: (_, vnode) => scrollCb(vnode)
            }
        }, selectLines(ctrl).map(line => renderLine(ctrl, line))),
        renderInput(ctrl)
    ];
    const presets = preset_1.presetView(ctrl.preset);
    if (presets)
        vnodes.push(presets);
    return vnodes;
}
exports.default = default_1;
function renderInput(ctrl) {
    if (!ctrl.vm.writeable)
        return;
    if ((ctrl.data.loginRequired && !ctrl.data.userId) || ctrl.data.restricted)
        return snabbdom_1.h('input.mchat__say', {
            attrs: {
                placeholder: ctrl.trans('loginToChat'),
                disabled: true
            }
        });
    let placeholder;
    if (ctrl.vm.timeout)
        placeholder = ctrl.trans('youHaveBeenTimedOut');
    else if (ctrl.opts.blind)
        placeholder = 'Chat';
    else
        placeholder = ctrl.trans.noarg(ctrl.vm.placeholderKey);
    return snabbdom_1.h('input.mchat__say', {
        attrs: {
            placeholder,
            autocomplete: 'off',
            maxlength: 140,
            disabled: ctrl.vm.timeout || !ctrl.vm.writeable
        },
        hook: {
            insert(vnode) {
                setupHooks(ctrl, vnode.elm);
            }
        }
    });
}
let mouchListener;
const setupHooks = (ctrl, chatEl) => {
    chatEl.addEventListener('keypress', (e) => setTimeout(() => {
        const el = e.target, txt = el.value, pub = ctrl.opts.public;
        if (e.which == 10 || e.which == 13) {
            if (txt === '')
                $('.keyboard-move input').focus();
            else {
                spam.report(txt);
                if (pub && spam.hasTeamUrl(txt))
                    alert("Please don't advertise teams in the chat.");
                else
                    ctrl.post(txt);
                el.value = '';
                if (!pub)
                    el.classList.remove('whisper');
            }
        }
        else {
            el.removeAttribute('placeholder');
            if (!pub)
                el.classList.toggle('whisper', !!txt.match(whisperRegex));
        }
    }));
    window.Mousetrap.bind('c', () => {
        chatEl.focus();
        return false;
    });
    window.Mousetrap(chatEl).bind('esc', () => chatEl.blur());
    // Ensure clicks remove chat focus.
    // See ornicar/chessground#109
    const mouchEvents = ['touchstart', 'mousedown'];
    if (mouchListener)
        mouchEvents.forEach(event => document.body.removeEventListener(event, mouchListener, { capture: true }));
    mouchListener = (e) => {
        if (!e.shiftKey && e.buttons !== 2 && e.button !== 2)
            chatEl.blur();
    };
    chatEl.onfocus = () => mouchEvents.forEach(event => document.body.addEventListener(event, mouchListener, { passive: true, capture: true }));
    chatEl.onblur = () => mouchEvents.forEach(event => document.body.removeEventListener(event, mouchListener, { capture: true }));
};
function sameLines(l1, l2) {
    return l1.d && l2.d && l1.u === l2.u;
}
function selectLines(ctrl) {
    let prev, ls = [];
    ctrl.data.lines.forEach(line => {
        if (!line.d &&
            (!prev || !sameLines(prev, line)) &&
            (!line.r || (line.u || '').toLowerCase() == ctrl.data.userId) &&
            !spam.skip(line.t))
            ls.push(line);
        prev = line;
    });
    return ls;
}
function updateText(parseMoves) {
    return (oldVnode, vnode) => {
        if (vnode.data.lichessChat !== oldVnode.data.lichessChat) {
            vnode.elm.innerHTML = enhance.enhance(vnode.data.lichessChat, parseMoves);
        }
    };
}
function renderText(t, parseMoves) {
    if (enhance.isMoreThanText(t)) {
        const hook = updateText(parseMoves);
        return snabbdom_1.h('t', {
            lichessChat: t,
            hook: {
                create: hook,
                update: hook
            }
        });
    }
    return snabbdom_1.h('t', t);
}
function report(ctrl, line) {
    const userA = line.querySelector('a.user-link');
    const text = line.querySelector('t').innerText;
    if (userA && confirm(`Report "${text}" to moderators?`))
        xhr_1.flag(ctrl.data.resourceId, userA.href.split('/')[4], text);
}
function renderLine(ctrl, line) {
    const textNode = renderText(line.t, ctrl.opts.parseMoves);
    if (line.u === 'lichess')
        return snabbdom_1.h('li.system', textNode);
    if (line.c)
        return snabbdom_1.h('li', [
            snabbdom_1.h('span.color', '[' + line.c + ']'),
            textNode
        ]);
    const userNode = snabbdom_1.thunk('a', line.u, util_1.userLink, [line.u, line.title]);
    return snabbdom_1.h('li', {}, ctrl.moderation() ? [
        line.u ? moderation_1.lineAction(line.u) : null,
        userNode,
        textNode
    ] : [
        ctrl.data.userId && line.u && ctrl.data.userId != line.u ? snabbdom_1.h('i.flag', {
            attrs: {
                'data-icon': '!',
                title: 'Report'
            }
        }) : null,
        userNode,
        textNode
    ]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY3Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kaXNjdXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQW1DO0FBR25DLCtCQUE4QjtBQUM5QixxQ0FBcUM7QUFDckMscUNBQXNDO0FBQ3RDLDZDQUEyRDtBQUMzRCxpQ0FBa0M7QUFDbEMsK0JBQTRCO0FBRTVCLE1BQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDO0FBRXpDLG1CQUF3QixJQUFVO0lBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU87UUFBRSxPQUFPLEVBQUUsQ0FBQztJQUNoQyxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQVksRUFBRSxFQUFFO1FBQ2hDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFrQixDQUFBO1FBQ25DLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM5QixNQUFNLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEcsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ3RCLFVBQVUsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7YUFDbkQ7U0FDRjtJQUNILENBQUMsRUFDRCxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3hCLE1BQU0sTUFBTSxHQUFHO1FBQ2IsWUFBQyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3JELEtB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LENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBQyxDQUFDLFFBQVEsRUFBRTtZQUNyRSxLQUFLLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxRQUFRO2FBQ2hCO1NBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1FBQ1QsUUFBUTtRQUNSLFFBQVE7S0FDVCxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaCwgdGh1bmsgfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlLCBWTm9kZURhdGEgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcbmltcG9ydCB7IEN0cmwsIExpbmUgfSBmcm9tICcuL2ludGVyZmFjZXMnXG5pbXBvcnQgKiBhcyBzcGFtIGZyb20gJy4vc3BhbSdcbmltcG9ydCAqIGFzIGVuaGFuY2UgZnJvbSAnLi9lbmhhbmNlJztcbmltcG9ydCB7IHByZXNldFZpZXcgfSBmcm9tICcuL3ByZXNldCc7XG5pbXBvcnQgeyBsaW5lQWN0aW9uIGFzIG1vZExpbmVBY3Rpb24gfSBmcm9tICcuL21vZGVyYXRpb24nO1xuaW1wb3J0IHsgdXNlckxpbmsgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgZmxhZyB9IGZyb20gJy4veGhyJ1xuXG5jb25zdCB3aGlzcGVyUmVnZXggPSAvXlxcL3coPzpoaXNwZXIpP1xccy87XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGN0cmw6IEN0cmwpOiBBcnJheTxWTm9kZSB8IHVuZGVmaW5lZD4ge1xuICBpZiAoIWN0cmwudm0uZW5hYmxlZCkgcmV0dXJuIFtdO1xuICBjb25zdCBzY3JvbGxDYiA9ICh2bm9kZTogVk5vZGUpID0+IHtcbiAgICBjb25zdCBlbCA9IHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudFxuICAgIGlmIChjdHJsLmRhdGEubGluZXMubGVuZ3RoID4gNSkge1xuICAgICAgY29uc3QgYXV0b1Njcm9sbCA9IChlbC5zY3JvbGxUb3AgPT09IDAgfHwgKGVsLnNjcm9sbFRvcCA+IChlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHQgLSAxMDApKSk7XG4gICAgICBpZiAoYXV0b1Njcm9sbCkge1xuICAgICAgICBlbC5zY3JvbGxUb3AgPSA5OTk5OTk7XG4gICAgICAgIHNldFRpbWVvdXQoKF86IGFueSkgPT4gZWwuc2Nyb2xsVG9wID0gOTk5OTk5LCAzMDApXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBtb2QgPSBjdHJsLm1vZGVyYXRpb24oKTtcbiAgY29uc3Qgdm5vZGVzID0gW1xuICAgIGgoJ29sLm1jaGF0X19tZXNzYWdlcy5jaGF0LXYtJyArIGN0cmwuZGF0YS5kb21WZXJzaW9uLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICByb2xlOiAnbG9nJyxcbiAgICAgICAgJ2FyaWEtbGl2ZSc6ICdwb2xpdGUnLFxuICAgICAgICAnYXJpYS1hdG9taWMnOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGhvb2s6IHtcbiAgICAgICAgaW5zZXJ0KHZub2RlKSB7XG4gICAgICAgICAgY29uc3QgJGVsID0gJCh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLm9uKCdjbGljaycsICdhLmp1bXAnLCAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5saWNoZXNzLnB1YnN1Yi5lbWl0KCdqdW1wJywgKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGx5JykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChtb2QpICRlbC5vbignY2xpY2snLCAnLm1vZCcsIChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgICAgbW9kLm9wZW4oKChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZXJuYW1lJykgYXMgc3RyaW5nKS5zcGxpdCgnICcpWzBdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbHNlICRlbC5vbignY2xpY2snLCAnLmZsYWcnLCAoZTogRXZlbnQpID0+XG4gICAgICAgICAgICByZXBvcnQoY3RybCwgKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50KVxuICAgICAgICAgICk7XG4gICAgICAgICAgc2Nyb2xsQ2Iodm5vZGUpO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0cGF0Y2g6IChfLCB2bm9kZSkgPT4gc2Nyb2xsQ2Iodm5vZGUpXG4gICAgICB9XG4gICAgfSwgc2VsZWN0TGluZXMoY3RybCkubWFwKGxpbmUgPT4gcmVuZGVyTGluZShjdHJsLCBsaW5lKSkpLFxuICAgIHJlbmRlcklucHV0KGN0cmwpXG4gIF07XG4gIGNvbnN0IHByZXNldHMgPSBwcmVzZXRWaWV3KGN0cmwucHJlc2V0KTtcbiAgaWYgKHByZXNldHMpIHZub2Rlcy5wdXNoKHByZXNldHMpXG4gIHJldHVybiB2bm9kZXM7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcklucHV0KGN0cmw6IEN0cmwpOiBWTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGlmICghY3RybC52bS53cml0ZWFibGUpIHJldHVybjtcbiAgaWYgKChjdHJsLmRhdGEubG9naW5SZXF1aXJlZCAmJiAhY3RybC5kYXRhLnVzZXJJZCkgfHwgY3RybC5kYXRhLnJlc3RyaWN0ZWQpXG4gICAgcmV0dXJuIGgoJ2lucHV0Lm1jaGF0X19zYXknLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICBwbGFjZWhvbGRlcjogY3RybC50cmFucygnbG9naW5Ub0NoYXQnKSxcbiAgICAgICAgZGlzYWJsZWQ6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgbGV0IHBsYWNlaG9sZGVyOiBzdHJpbmc7XG4gIGlmIChjdHJsLnZtLnRpbWVvdXQpIHBsYWNlaG9sZGVyID0gY3RybC50cmFucygneW91SGF2ZUJlZW5UaW1lZE91dCcpO1xuICBlbHNlIGlmIChjdHJsLm9wdHMuYmxpbmQpIHBsYWNlaG9sZGVyID0gJ0NoYXQnO1xuICBlbHNlIHBsYWNlaG9sZGVyID0gY3RybC50cmFucy5ub2FyZyhjdHJsLnZtLnBsYWNlaG9sZGVyS2V5KTtcbiAgcmV0dXJuIGgoJ2lucHV0Lm1jaGF0X19zYXknLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIHBsYWNlaG9sZGVyLFxuICAgICAgYXV0b2NvbXBsZXRlOiAnb2ZmJyxcbiAgICAgIG1heGxlbmd0aDogMTQwLFxuICAgICAgZGlzYWJsZWQ6IGN0cmwudm0udGltZW91dCB8fCAhY3RybC52bS53cml0ZWFibGVcbiAgICB9LFxuICAgIGhvb2s6IHtcbiAgICAgIGluc2VydCh2bm9kZSkge1xuICAgICAgICBzZXR1cEhvb2tzKGN0cmwsIHZub2RlLmVsbSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxubGV0IG1vdWNoTGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI7XG5cbmNvbnN0IHNldHVwSG9va3MgPSAoY3RybDogQ3RybCwgY2hhdEVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICBjaGF0RWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLFxuICAgIChlOiBLZXlib2FyZEV2ZW50KSA9PiBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IGVsID0gZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCxcbiAgICAgICAgdHh0ID0gZWwudmFsdWUsXG4gICAgICAgIHB1YiA9IGN0cmwub3B0cy5wdWJsaWM7XG4gICAgICBpZiAoZS53aGljaCA9PSAxMCB8fCBlLndoaWNoID09IDEzKSB7XG4gICAgICAgIGlmICh0eHQgPT09ICcnKSAkKCcua2V5Ym9hcmQtbW92ZSBpbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNwYW0ucmVwb3J0KHR4dCk7XG4gICAgICAgICAgaWYgKHB1YiAmJiBzcGFtLmhhc1RlYW1VcmwodHh0KSkgYWxlcnQoXCJQbGVhc2UgZG9uJ3QgYWR2ZXJ0aXNlIHRlYW1zIGluIHRoZSBjaGF0LlwiKTtcbiAgICAgICAgICBlbHNlIGN0cmwucG9zdCh0eHQpO1xuICAgICAgICAgIGVsLnZhbHVlID0gJyc7XG4gICAgICAgICAgaWYgKCFwdWIpIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3doaXNwZXInKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKTtcbiAgICAgICAgaWYgKCFwdWIpIGVsLmNsYXNzTGlzdC50b2dnbGUoJ3doaXNwZXInLCAhIXR4dC5tYXRjaCh3aGlzcGVyUmVnZXgpKTtcbiAgICAgIH1cbiAgICB9KVxuICApO1xuXG4gIHdpbmRvdy5Nb3VzZXRyYXAuYmluZCgnYycsICgpID0+IHtcbiAgICBjaGF0RWwuZm9jdXMoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gIHdpbmRvdy5Nb3VzZXRyYXAoY2hhdEVsKS5iaW5kKCdlc2MnLCAoKSA9PiBjaGF0RWwuYmx1cigpKTtcblxuXG4gIC8vIEVuc3VyZSBjbGlja3MgcmVtb3ZlIGNoYXQgZm9jdXMuXG4gIC8vIFNlZSBvcm5pY2FyL2NoZXNzZ3JvdW5kIzEwOVxuXG4gIGNvbnN0IG1vdWNoRXZlbnRzID0gWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddO1xuXG4gIGlmIChtb3VjaExpc3RlbmVyKSBtb3VjaEV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBtb3VjaExpc3RlbmVyLCB7Y2FwdHVyZTogdHJ1ZX0pXG4gICk7XG5cbiAgbW91Y2hMaXN0ZW5lciA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgaWYgKCFlLnNoaWZ0S2V5ICYmIGUuYnV0dG9ucyAhPT0gMiAmJiBlLmJ1dHRvbiAhPT0gMikgY2hhdEVsLmJsdXIoKTtcbiAgfTtcblxuICBjaGF0RWwub25mb2N1cyA9ICgpID0+XG4gICAgbW91Y2hFdmVudHMuZm9yRWFjaChldmVudCA9PlxuICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBtb3VjaExpc3RlbmVyLFxuICAgICAgICB7cGFzc2l2ZTogdHJ1ZSwgY2FwdHVyZTogdHJ1ZX1cbiAgICAgICkpO1xuXG4gIGNoYXRFbC5vbmJsdXIgPSAoKSA9PlxuICAgIG1vdWNoRXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgbW91Y2hMaXN0ZW5lciwge2NhcHR1cmU6IHRydWV9KVxuICAgICk7XG59O1xuXG5mdW5jdGlvbiBzYW1lTGluZXMobDE6IExpbmUsIGwyOiBMaW5lKSB7XG4gIHJldHVybiBsMS5kICYmIGwyLmQgJiYgbDEudSA9PT0gbDIudTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0TGluZXMoY3RybDogQ3RybCk6IEFycmF5PExpbmU+IHtcbiAgbGV0IHByZXY6IExpbmUsIGxzOiBBcnJheTxMaW5lPiA9IFtdO1xuICBjdHJsLmRhdGEubGluZXMuZm9yRWFjaChsaW5lID0+IHtcbiAgICBpZiAoIWxpbmUuZCAmJlxuICAgICAgKCFwcmV2IHx8ICFzYW1lTGluZXMocHJldiwgbGluZSkpICYmXG4gICAgICAoIWxpbmUuciB8fCAobGluZS51IHx8ICcnKS50b0xvd2VyQ2FzZSgpID09IGN0cmwuZGF0YS51c2VySWQpICYmXG4gICAgICAhc3BhbS5za2lwKGxpbmUudClcbiAgICApIGxzLnB1c2gobGluZSk7XG4gICAgcHJldiA9IGxpbmU7XG4gIH0pO1xuICByZXR1cm4gbHM7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRleHQocGFyc2VNb3ZlczogYm9vbGVhbikge1xuICByZXR1cm4gKG9sZFZub2RlOiBWTm9kZSwgdm5vZGU6IFZOb2RlKSA9PiB7XG4gICAgaWYgKCh2bm9kZS5kYXRhIGFzIFZOb2RlRGF0YSkubGljaGVzc0NoYXQgIT09IChvbGRWbm9kZS5kYXRhIGFzIFZOb2RlRGF0YSkubGljaGVzc0NoYXQpIHtcbiAgICAgICh2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQpLmlubmVySFRNTCA9IGVuaGFuY2UuZW5oYW5jZSgodm5vZGUuZGF0YSBhcyBWTm9kZURhdGEpLmxpY2hlc3NDaGF0LCBwYXJzZU1vdmVzKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRleHQodDogc3RyaW5nLCBwYXJzZU1vdmVzOiBib29sZWFuKSB7XG4gIGlmIChlbmhhbmNlLmlzTW9yZVRoYW5UZXh0KHQpKSB7XG4gICAgY29uc3QgaG9vayA9IHVwZGF0ZVRleHQocGFyc2VNb3Zlcyk7XG4gICAgcmV0dXJuIGgoJ3QnLCB7XG4gICAgICBsaWNoZXNzQ2hhdDogdCxcbiAgICAgIGhvb2s6IHtcbiAgICAgICAgY3JlYXRlOiBob29rLFxuICAgICAgICB1cGRhdGU6IGhvb2tcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaCgndCcsIHQpO1xufVxuXG5mdW5jdGlvbiByZXBvcnQoY3RybDogQ3RybCwgbGluZTogSFRNTEVsZW1lbnQpIHtcbiAgY29uc3QgdXNlckEgPSBsaW5lLnF1ZXJ5U2VsZWN0b3IoJ2EudXNlci1saW5rJykgYXMgSFRNTExpbmtFbGVtZW50O1xuICBjb25zdCB0ZXh0ID0gKGxpbmUucXVlcnlTZWxlY3RvcigndCcpIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQ7XG4gIGlmICh1c2VyQSAmJiBjb25maXJtKGBSZXBvcnQgXCIke3RleHR9XCIgdG8gbW9kZXJhdG9ycz9gKSkgZmxhZyhcbiAgICBjdHJsLmRhdGEucmVzb3VyY2VJZCxcbiAgICB1c2VyQS5ocmVmLnNwbGl0KCcvJylbNF0sXG4gICAgdGV4dFxuICApO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaW5lKGN0cmw6IEN0cmwsIGxpbmU6IExpbmUpIHtcblxuICBjb25zdCB0ZXh0Tm9kZSA9IHJlbmRlclRleHQobGluZS50LCBjdHJsLm9wdHMucGFyc2VNb3Zlcyk7XG5cbiAgaWYgKGxpbmUudSA9PT0gJ2xpY2hlc3MnKSByZXR1cm4gaCgnbGkuc3lzdGVtJywgdGV4dE5vZGUpO1xuXG4gIGlmIChsaW5lLmMpIHJldHVybiBoKCdsaScsIFtcbiAgICBoKCdzcGFuLmNvbG9yJywgJ1snICsgbGluZS5jICsgJ10nKSxcbiAgICB0ZXh0Tm9kZVxuICBdKTtcblxuICBjb25zdCB1c2VyTm9kZSA9IHRodW5rKCdhJywgbGluZS51LCB1c2VyTGluaywgW2xpbmUudSwgbGluZS50aXRsZV0pO1xuXG4gIHJldHVybiBoKCdsaScsIHtcbiAgfSwgY3RybC5tb2RlcmF0aW9uKCkgPyBbXG4gICAgbGluZS51ID8gbW9kTGluZUFjdGlvbihsaW5lLnUpIDogbnVsbCxcbiAgICB1c2VyTm9kZSxcbiAgICB0ZXh0Tm9kZVxuICBdIDogW1xuICAgIGN0cmwuZGF0YS51c2VySWQgJiYgbGluZS51ICYmIGN0cmwuZGF0YS51c2VySWQgIT0gbGluZS51ID8gaCgnaS5mbGFnJywge1xuICAgICAgYXR0cnM6IHtcbiAgICAgICAgJ2RhdGEtaWNvbic6ICchJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQnXG4gICAgICB9XG4gICAgfSkgOiBudWxsLFxuICAgIHVzZXJOb2RlLFxuICAgIHRleHROb2RlXG4gIF0pO1xufVxuIl19