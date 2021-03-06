import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    NgZone, TemplateRef, ViewChild
} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {MatIconRegistry} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Observable, of} from "rxjs";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'demo-icon-view',
    templateUrl: 'icon.component.html'
})
export class DemoIconView implements AfterViewInit {

    @ViewChild('copied', {read: TemplateRef})
    private copied!: TemplateRef<any>;

    @HostBinding('class') class: string = 'demo-icon-view';

    icons$!: Observable<string[]>;

    public readonly icons: string[] = ["123.svg", "2k.svg", "2k_plus.svg", "30fps.svg", "360.svg", "4k.svg", "4k_plus.svg", "60fps.svg", "8k.svg", "8k_plus.svg", "abc.svg", "accessibility.svg", "accessible.svg", "accounts_off.svg", "account_on.svg", "add.svg", "admin_panel_settings.svg", "airplay.svg", "alarm.svg", "album.svg", "all_inbox.svg", "android.svg", "apartment.svg", "apps.svg", "archive.svg", "arrow_backward.svg", "arrow_circle_down.svg", "arrow_circle_left.svg", "arrow_circle_right.svg", "arrow_circle_up.svg", "arrow_down.svg", "arrow_downward.svg", "arrow_drop_down_circle.svg", "arrow_forward.svg", "arrow_left.svg", "arrow_right.svg", "arrow_up.svg", "arrow_upward.svg", "assignment.svg", "atm.svg", "attachment.svg", "attractions.svg", "authenticator.svg", "backup.svg", "badge.svg", "balance.svg", "beach_access.svg", "bed.svg", "biotech.svg", "bitcoin.svg", "blanket.svg", "blender.svg", "block.svg", "bookmark.svg", "brush.svg", "build.svg", "cabin.svg", "cable.svg", "cake.svg", "calculate.svg", "calendar_view_day.svg", "calendar_view_month.svg", "calendar_view_week.svg", "call_end.svg", "call_start.svg", "camera.svg", "camera_roll.svg", "campaign.svg", "caption_off.svg", "caption_on.svg", "cast.svg", "castle.svg", "category.svg", "chair.svg", "change_circle.svg", "chat.svg", "checkroom.svg", "church.svg", "clean_hands.svg", "close.svg", "cloudbuild.svg", "cloud_download.svg", "cloud_upload.svg", "code_off.svg", "code_on.svg", "coffee_maker.svg", "comment.svg", "compass.svg", "compost.svg", "construction.svg", "contact_mail.svg", "cookie.svg", "copyright.svg", "coronavirus.svg", "cottage.svg", "credit_card.svg", "css.svg", "cyclone.svg", "dark_mode.svg", "dashboard.svg", "database.svg", "data_array.svg", "data_object.svg", "delete.svg", "desk.svg", "desktop_mac.svg", "desktop_windows.svg", "developer_board.svg", "devices.svg", "devices_other.svg", "device_thermostat.svg", "dialpad.svg", "discover_tune.svg", "display_settings.svg", "dns.svg", "docs.svg", "document_scanner.svg", "double_arrow.svg", "downhill_skiing.svg", "download.svg", "downloading.svg", "download_for_offline.svg", "do_not_disturb_off.svg", "do_not_disturb_on.svg", "drafts.svg", "draw.svg", "duo.svg", "eco.svg", "edit.svg", "egg.svg", "eject.svg", "electrical_services.svg", "electric_bike.svg", "electric_bolt.svg", "electric_rickshaw.svg", "electric_scooter.svg", "elevator.svg", "emergency.svg", "emoji_symbols.svg", "engineering.svg", "error.svg", "event.svg", "event_note.svg", "ev_station.svg", "expand_circle.svg", "explore_off.svg", "explore_on.svg", "extension.svg", "factory.svg", "family_restroom.svg", "fastfood.svg", "fast_rewind.svg", "favorite.svg", "fax.svg", "female.svg", "fence.svg", "festival.svg", "fiber_new.svg", "filter_list.svg", "find_replace.svg", "fingerprint.svg", "fire_extinguisher.svg", "fire_hydrant.svg", "fire_truck.svg", "first_page.svg", "fitness_center.svg", "flag.svg", "flight.svg", "flip.svg", "flood.svg", "flutter_dash.svg", "food_on.svg", "forest.svg", "fort.svg", "forum.svg", "forward_10.svg", "forward_30.svg", "forward_5.svg", "fullscreen_enter.svg", "fullscreen_exit.svg", "grass.svg", "grid_off.svg", "grid_on.svg", "group_off.svg", "group_on.svg", "hardware.svg", "headphones.svg", "headset_mic.svg", "hearing.svg", "hearing_disabled.svg", "hearing_enable.svg", "heart_broken.svg", "help.svg", "high_quality.svg", "hiking.svg", "history.svg", "hive.svg", "hls.svg", "home.svg", "http.svg", "hub.svg", "ice_skating.svg", "image.svg", "inbox.svg", "info.svg", "interests.svg", "inventory.svg", "iron.svg", "javascript.svg", "join_full.svg", "join_inner.svg", "join_left.svg", "join_right.svg", "kayaking.svg", "keyboard.svg", "keyboard_arrow_down.svg", "keyboard_arrow_left.svg", "keyboard_arrow_right.svg", "keyboard_arrow_up.svg", "keyboard_command_key.svg", "keyboard_double_arrow_down.svg", "keyboard_double_arrow_left.svg", "keyboard_double_arrow_right.svg", "keyboard_double_arrow_up.svg", "key_off.svg", "key_on.svg", "kitesurfing.svg", "kormo.svg", "label_off.svg", "label_on.svg", "language.svg", "laptop.svg", "laptop_chromebook.svg", "laptop_mac.svg", "laptop_windows.svg", "last_page.svg", "library_add.svg", "library_books.svg", "library_music.svg", "light.svg", "light_mode.svg", "link.svg", "local_gas_station.svg", "local_parking.svg", "local_shipping.svg", "local_taxi.svg", "lock_close.svg", "lock_open.svg", "loupe.svg", "luggage.svg", "mail.svg", "male.svg", "man.svg", "manage_accounts.svg", "manage_search.svg", "map.svg", "mark_email_read.svg", "mark_email_unread.svg", "masks.svg", "memory.svg", "menu.svg", "microwave.svg", "mic_off.svg", "mic_on.svg", "military_tech.svg", "mode_fan_off.svg", "mode_fan_on.svg", "mode_heat.svg", "money.svg", "monitor.svg", "monitor_heart.svg", "more_horiz.svg", "more_vert.svg", "mosque.svg", "motorcycle.svg", "mouse.svg", "movie.svg", "museum.svg", "nest_remote.svg", "newspaper.svg", "notifications.svg", "notifications_active.svg", "no_adult_content.svg", "no_meals.svg", "oil_barrel.svg", "open_in_browser.svg", "outbox.svg", "outdoor_grill.svg", "outlet.svg", "palette.svg", "paragliding.svg", "park.svg", "password.svg", "pattern.svg", "pause_circle.svg", "pedal_bike.svg", "pending.svg", "personal_injury.svg", "person_off.svg", "person_on.svg", "pets.svg", "phishing.svg", "phone_android.svg", "phone_iphone.svg", "photo_library.svg", "php.svg", "piano_off.svg", "piano_on.svg", "playlist_play.svg", "play_circle.svg", "play_services.svg", "plumbing.svg", "policy.svg", "polymer.svg", "power_off.svg", "power_on.svg", "precision_manufacturing.svg", "preview.svg", "print.svg", "qr_code.svg", "radio.svg", "receipt.svg", "recycling.svg", "redo.svg", "reduce_capacity.svg", "remove.svg", "repeat_off.svg", "repeat_on.svg", "repeat_one_off.svg", "repeat_one_on.svg", "replay.svg", "replay_10.svg", "replay_30.svg", "replay_5.svg", "retention.svg", "rocket_launch.svg", "roller_skating.svg", "route.svg", "router.svg", "rowing.svg", "rsvp.svg", "rule.svg", "sailing.svg", "sanitizer.svg", "satellite.svg", "save.svg", "save_as.svg", "savings.svg", "scale.svg", "scanner.svg", "schedule.svg", "school.svg", "science.svg", "score.svg", "scoreboard.svg", "screenshot_monitor.svg", "screenshot_phone.svg", "scuba_diving.svg", "search.svg", "security.svg", "sell.svg", "send.svg", "sensors.svg", "settings.svg", "settings_input_svideo.svg", "settings_voice.svg", "share.svg", "sheets.svg", "shopping_bag.svg", "shopping_cart.svg", "shower.svg", "shuffle_off.svg", "shuffle_on.svg", "signpost.svg", "sim_card.svg", "skateboarding.svg", "skip_next.svg", "sledding.svg", "slides.svg", "slideshow.svg", "smartphone.svg", "smoke_no.svg", "smoke_yes.svg", "sms.svg", "snooze.svg", "snowboarding.svg", "soap.svg", "sort.svg", "sos.svg", "spa.svg", "speaker.svg", "speaker_group.svg", "speed.svg", "sports.svg", "sports_baseball.svg", "sports_basketball.svg", "sports_boxing.svg", "sports_cricket.svg", "sports_esports.svg", "sports_football.svg", "sports_gymnastics.svg", "sports_handball.svg", "sports_hockey.svg", "sports_kabaddi.svg", "sports_martial_arts.svg", "sports_motorsports.svg", "sports_rugby.svg", "sports_score.svg", "sports_soccer.svg", "sports_tennis.svg", "sports_volleyball.svg", "stadia_controller.svg", "stadium.svg", "star.svg", "stars.svg", "stateful.svg", "stop_circle.svg", "storage.svg", "store.svg", "storm.svg", "stream.svg", "streetview.svg", "style.svg", "subscriptions.svg", "subtitles.svg", "support.svg", "support_agent.svg", "surfing.svg", "synagogue.svg", "sync.svg", "tab.svg", "tablet.svg", "tablet_android.svg", "tablet_mac.svg", "table_view.svg", "temple_buddhist.svg", "temple_hindu.svg", "terminal.svg", "theaters.svg", "thermometer.svg", "thumb_down.svg", "thumb_up.svg", "timelapse.svg", "timer.svg", "today.svg", "token.svg", "topic.svg", "tractor.svg", "traffic.svg", "train.svg", "tram.svg", "translate.svg", "tsunami.svg", "tune.svg", "tv.svg", "two_wheeler.svg", "umbrella.svg", "unarchive.svg", "undo.svg", "update.svg", "upgrade.svg", "upload.svg", "usb.svg", "vaccines.svg", "verified.svg", "vibration.svg", "videocam_off.svg", "videocam_on.svg", "videogame_asset.svg", "video_call.svg", "video_library.svg", "video_settings.svg", "view_agenda.svg", "view_array.svg", "view_carousel.svg", "view_column.svg", "view_comfy.svg", "view_compact.svg", "view_cozy.svg", "view_day.svg", "view_headline.svg", "view_kanban.svg", "view_list.svg", "view_module.svg", "view_quilt.svg", "view_sidebar.svg", "view_stream.svg", "view_timeline.svg", "view_week.svg", "visibility_off.svg", "visibility_on.svg", "voicemail.svg", "volume_down.svg", "volume_mute.svg", "volume_off.svg", "volume_up.svg", "wallet.svg", "warning.svg", "watch.svg", "water.svg", "water_drop.svg", "wc.svg", "web.svg", "webhook.svg", "widgets.svg", "wifi.svg", "woman.svg", "workspaces.svg", "workspace_premium.svg", "youtube_music.svg", "youtube_tv.svg", "zoom_in.svg", "zoom_in_map.svg", "zoom_out.svg", "zoom_out_map.svg"];

    constructor(
        private _cdr: ChangeDetectorRef,
        private _sanitizer: DomSanitizer,
        private _zone: NgZone,
        private _registry: MatIconRegistry,
        private _snackbar: MatSnackBar
    ) {
    }

    ngAfterViewInit() {
        let task = setTimeout(() => {
            clearTimeout(task);
            this._zone.runOutsideAngular(() => this.registerSVGIcons())
                .then(() => {
                    this.icons$ = of(this.icons);
                    this._zone.run(() => this._cdr.detectChanges());
                });
        }, 1000);
    }

    listenClipboardCopiedChange(change: boolean): void {
        if (this.copied && change) {
            this._snackbar.openFromTemplate(this.copied, {duration: 1000, panelClass: ['bg-warn']});
        }
    }

    private async registerSVGIcons(): Promise<void> {
        for (let icon of this.icons) {
            this._registry.addSvgIcon(icon.replace('.svg', ''),
                this._sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}`))
        }
    }

}
