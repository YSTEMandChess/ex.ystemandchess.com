(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const searchParams = new URL(self.location.href).searchParams;
const assetBase = new URL(searchParams.get('asset-url'), self.location.href).href;
function assetUrl(path) {
    return `${assetBase}assets/${path}`;
}
self.addEventListener('push', event => {
    const data = event.data.json();
    return event.waitUntil(self.registration.showNotification(data.title, {
        badge: assetUrl('logo/lichess-mono-128.png'),
        icon: assetUrl('logo/lichess-favicon-192.png'),
        body: data.body,
        tag: data.tag,
        data: data.payload,
        requireInteraction: true,
    }));
});
function handleNotificationClick(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield self.registration.getNotifications();
        notifications.forEach(notification => notification.close());
        const windowClients = yield self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        });
        // determine url
        const data = event.notification.data.userData;
        let url = '/';
        if (data.fullId)
            url = '/' + data.fullId;
        else if (data.threadId)
            url = '/inbox/' + data.threadId + '#bottom';
        else if (data.challengeId)
            url = '/' + data.challengeId;
        // focus open window with same url
        for (const client of windowClients) {
            const clientUrl = new URL(client.url, self.location.href);
            if (clientUrl.pathname === url && 'focus' in client)
                return yield client.focus();
        }
        // navigate from open homepage to url
        for (const client of windowClients) {
            const clientUrl = new URL(client.url, self.location.href);
            if (clientUrl.pathname === '/')
                return yield client.navigate(url);
        }
        // open new window
        return yield self.clients.openWindow(url);
    });
}
self.addEventListener('notificationclick', e => e.waitUntil(handleNotificationClick(e)));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUM5RCxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBRW5GLFNBQVMsUUFBUSxDQUFDLElBQVk7SUFDNUIsT0FBTyxHQUFHLFNBQVMsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUN0QyxDQUFDO0FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtJQUNwQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hDLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDcEUsS0FBSyxFQUFFLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQztRQUM1QyxJQUFJLEVBQUUsUUFBUSxDQUFDLDhCQUE4QixDQUFDO1FBQzlDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtRQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztRQUNiLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztRQUNsQixrQkFBa0IsRUFBRSxJQUFJO0tBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxTQUFlLHVCQUF1QixDQUFDLEtBQXdCOztRQUM3RCxNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNqRSxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFFNUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUNoRCxJQUFJLEVBQUUsUUFBUTtZQUNkLG1CQUFtQixFQUFFLElBQUk7U0FDMUIsQ0FBZ0MsQ0FBQztRQUVsQyxnQkFBZ0I7UUFDaEIsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNkLElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDcEMsSUFBSSxJQUFJLENBQUMsUUFBUTtZQUFFLEdBQUcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7YUFDL0QsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUV4RCxrQ0FBa0M7UUFDbEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxhQUFhLEVBQUU7WUFDbEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELElBQUksU0FBUyxDQUFDLFFBQVEsS0FBSyxHQUFHLElBQUksT0FBTyxJQUFJLE1BQU07Z0JBQUUsT0FBTyxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNsRjtRQUVELHFDQUFxQztRQUNyQyxLQUFLLE1BQU0sTUFBTSxJQUFJLGFBQWEsRUFBRTtZQUNsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsSUFBSSxTQUFTLENBQUMsUUFBUSxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkU7UUFFRCxrQkFBa0I7UUFDbEIsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FBQTtBQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTChzZWxmLmxvY2F0aW9uLmhyZWYpLnNlYXJjaFBhcmFtcztcbmNvbnN0IGFzc2V0QmFzZSA9IG5ldyBVUkwoc2VhcmNoUGFyYW1zLmdldCgnYXNzZXQtdXJsJykhLCBzZWxmLmxvY2F0aW9uLmhyZWYpLmhyZWY7XG5cbmZ1bmN0aW9uIGFzc2V0VXJsKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgJHthc3NldEJhc2V9YXNzZXRzLyR7cGF0aH1gO1xufVxuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3B1c2gnLCBldmVudCA9PiB7XG4gIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhIS5qc29uKCk7XG4gIHJldHVybiBldmVudC53YWl0VW50aWwoc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihkYXRhLnRpdGxlLCB7XG4gICAgYmFkZ2U6IGFzc2V0VXJsKCdsb2dvL2xpY2hlc3MtbW9uby0xMjgucG5nJyksXG4gICAgaWNvbjogYXNzZXRVcmwoJ2xvZ28vbGljaGVzcy1mYXZpY29uLTE5Mi5wbmcnKSxcbiAgICBib2R5OiBkYXRhLmJvZHksXG4gICAgdGFnOiBkYXRhLnRhZyxcbiAgICBkYXRhOiBkYXRhLnBheWxvYWQsXG4gICAgcmVxdWlyZUludGVyYWN0aW9uOiB0cnVlLFxuICB9KSk7XG59KTtcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTm90aWZpY2F0aW9uQ2xpY2soZXZlbnQ6IE5vdGlmaWNhdGlvbkV2ZW50KSB7XG4gIGNvbnN0IG5vdGlmaWNhdGlvbnMgPSBhd2FpdCBzZWxmLnJlZ2lzdHJhdGlvbi5nZXROb3RpZmljYXRpb25zKCk7XG4gIG5vdGlmaWNhdGlvbnMuZm9yRWFjaChub3RpZmljYXRpb24gPT4gbm90aWZpY2F0aW9uLmNsb3NlKCkpO1xuXG4gIGNvbnN0IHdpbmRvd0NsaWVudHMgPSBhd2FpdCBzZWxmLmNsaWVudHMubWF0Y2hBbGwoe1xuICAgIHR5cGU6ICd3aW5kb3cnLFxuICAgIGluY2x1ZGVVbmNvbnRyb2xsZWQ6IHRydWUsXG4gIH0pIGFzIFJlYWRvbmx5QXJyYXk8V2luZG93Q2xpZW50PjtcblxuICAvLyBkZXRlcm1pbmUgdXJsXG4gIGNvbnN0IGRhdGEgPSBldmVudC5ub3RpZmljYXRpb24uZGF0YS51c2VyRGF0YTtcbiAgbGV0IHVybCA9ICcvJztcbiAgaWYgKGRhdGEuZnVsbElkKSB1cmwgPSAnLycgKyBkYXRhLmZ1bGxJZDtcbiAgZWxzZSBpZiAoZGF0YS50aHJlYWRJZCkgdXJsID0gJy9pbmJveC8nICsgZGF0YS50aHJlYWRJZCArICcjYm90dG9tJztcbiAgZWxzZSBpZiAoZGF0YS5jaGFsbGVuZ2VJZCkgdXJsID0gJy8nICsgZGF0YS5jaGFsbGVuZ2VJZDtcblxuICAvLyBmb2N1cyBvcGVuIHdpbmRvdyB3aXRoIHNhbWUgdXJsXG4gIGZvciAoY29uc3QgY2xpZW50IG9mIHdpbmRvd0NsaWVudHMpIHtcbiAgICBjb25zdCBjbGllbnRVcmwgPSBuZXcgVVJMKGNsaWVudC51cmwsIHNlbGYubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKGNsaWVudFVybC5wYXRobmFtZSA9PT0gdXJsICYmICdmb2N1cycgaW4gY2xpZW50KSByZXR1cm4gYXdhaXQgY2xpZW50LmZvY3VzKCk7XG4gIH1cblxuICAvLyBuYXZpZ2F0ZSBmcm9tIG9wZW4gaG9tZXBhZ2UgdG8gdXJsXG4gIGZvciAoY29uc3QgY2xpZW50IG9mIHdpbmRvd0NsaWVudHMpIHtcbiAgICBjb25zdCBjbGllbnRVcmwgPSBuZXcgVVJMKGNsaWVudC51cmwsIHNlbGYubG9jYXRpb24uaHJlZik7XG4gICAgaWYgKGNsaWVudFVybC5wYXRobmFtZSA9PT0gJy8nKSByZXR1cm4gYXdhaXQgY2xpZW50Lm5hdmlnYXRlKHVybCk7XG4gIH1cblxuICAvLyBvcGVuIG5ldyB3aW5kb3dcbiAgcmV0dXJuIGF3YWl0IHNlbGYuY2xpZW50cy5vcGVuV2luZG93KHVybCk7XG59XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbm90aWZpY2F0aW9uY2xpY2snLCBlID0+IGUud2FpdFVudGlsKGhhbmRsZU5vdGlmaWNhdGlvbkNsaWNrKGUpKSk7XG4iXX0=
