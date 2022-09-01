// ------------------------ hybrid variables ---------------------------------------------------
const generalItemUrl = window.location.protocol + "//" + window.location.host;
// const generalItemUrl = window.location.protocol + "//" + window.location.host + "/items/";


let itemUrl = '';
let prevItemId = null;
const quickviewBtn = '<div class="quickview_btn" role="button">' + btn_text + '</div>';
const linkItem = '<div class="link_wrapper"><a class="quickview_item_link" href="#">' + go_to_item_btn_text + '</a></div>';
let itemUpgrades = {};
let isMultiple = false;
let htmlData = '';
let storeLayout = $("body").attr("data-layout"); // undefined if layout changed

let listItemQvBtn = '';
if (eye_icon == "true") {
    const eyeIcon = '<svg style="color: white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"> <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" fill="white"></path> <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" fill="white"></path> </svg>'
    listItemQvBtn = '<div class="quickview_btn_wrapper">' + quickviewBtn + eyeIcon + '</div>';
} else {
    listItemQvBtn = '<div class="quickview_btn_wrapper">' + quickviewBtn + '</div>';
}


// ------------------------------------------------- FUNCTIONS -----------------------------------------------

// ------------------------------------------- add QV btn in grid --------------------------------------------
const itemsExcept = () => {
    $(".layout_list_item").each(function () {
        const item = $(this);
        const item_class = item.find(".item_class").text();

        if (item_class && item_class != "") {
            item.addClass(item_class)
        }
    })
}

// c_x + g_x
const quickviewLayoutListItems = () => {
    try {
        // itemsExcept();

        $('body:not(.articles) .layout_list_item:not(.set_quickview)').each(function () {

            let listItem = $(this);

            listItem.addClass('set_quickview');
            listItem.find('.grid').append(listItemQvBtn);

            listItem.find('.quickview_btn').click(function (event) {
                event.preventDefault();
                const itemId = (($(this).parents('.layout_list_item').first().attr('id')).match(/\d+/))[0];
                let link = $(this).parents('.layout_list_item').first().find("a").attr("href").trim();

                quickviewBtnClickHandler(itemId, link);

            });
        });

    } catch (error) {
        console.log("TCL: function quickviewLayoutListItems -> error", error);
    }
}

const quickviewDynamicCarousel = () => {
    try {
        if ($("body #bg_middle #dynamic-carousel-client").length) {
            $('body #dynamic-carousel-client .swiper-slide:not(.set_quickview)').each(function () {

                let listItem = $(this);

                listItem.append(listItemQvBtn);
                listItem.addClass('set_quickview');

                listItem.find('.quickview_btn').click(function () {
                    // const strItemClasses = $(this).parents('.swiper-slide').first().attr('data-item-css-class') || ""; 
                    const itemId = $(this).parents('.swiper-slide').first().attr("data-item-id");

                    quickviewBtnClickHandler(itemId);

                });
            });

        }
    } catch (error) {
        console.log("TCL: function quickviewDynamicCarousel -> error", error);
    }
}

// infinite loding
const quickviewFuncInfscr = () => {
    try {
        $(document).ajaxComplete(function (event, xhr, settings) {
            // itemsExcept();
            quickviewLayoutListItems();
        });
    } catch (error) {
        console.log("TCL: quickviewFuncInfscr -> error", error);
    }
}

// ------------------------------------------------------------------------------------------------------------

// ------------------------------------------- load QV popup --------------------------------------------------
// load QV popup
const quickviewBtnClickHandler = (qvItemId, itemLink) => {

    try {
        $('#quickview_loading_animation_wrapper').show(); // show loading animation
        $('#wrap_quickview').fadeIn();

        // if new item -> load qv
        if (prevItemId != qvItemId) {
            prevItemId = qvItemId;
            isMultiple = false;
            itemUpgrades = {};

            if (itemLink && itemLink.includes("current_customer")) {
                itemUrl = itemLink;
            } else if (itemLink && itemLink.includes("/items/") && !itemLink.includes("current_customer")) {
                itemUrl = generalItemUrl + itemLink;
            } else {
                itemUrl = generalItemUrl + "/items/" + qvItemId;
            }

            $("#wrap_quickview").removeAttr('class');
            $("#wrap_quickview").attr('item-id', qvItemId);

            $.ajax({
                url: itemUrl,
                method: "GET",
                success: function (data) {
                    htmlData = data;
                    $("#wrap_quickview .quickview_main").html($(data).find('form#new_order'));

                    // trigger for match other hybrids
                    $("#wrap_quickview").trigger("openqv");

                    $('#quickview_loading_animation_wrapper').fadeOut(0);
                    quickviewFadein();

                    generalChangesInQuickview(itemUrl);
                    quickviewChangesAfterLoad();
                }
            })

            // if previous item -> open the same qv
        } else {
            if (show_addCart == "true") {
                resetCounter();
            }

            $('#quickview_loading_animation_wrapper').fadeOut(0);
            quickviewFadein();
            // quickviewChangesAfterLoad();
        }

    } catch (error) {
        console.log("TCL: quickviewBtnClickHandler -> error", error);
    }
}

const quickviewFadein = () => {
    try {
        $('#wrap_quickview .quickview').fadeIn(0);
    } catch (error) {
        console.log("TCL: quickviewFadein -> error", error);
    }
}

const quickviewFadeout = () => {
    try {
        $('#wrap_quickview, #wrap_quickview .quickview').fadeOut(300);
    } catch (error) {
        console.log("TCL: quickviewFadeout -> error", error);
    }
}

// ------------------------------------------- QV view changes --------------------------------------------

// view changes
const generalChangesInQuickview = (itemUrl) => {

    try {
        // remove deal_items + also_buy + liquid_upgrades
        $("#wrap_quickview #item_info").remove();
        // $(".item_main_top .wrap_content_top").remove(); // liquids from item top 


        if (typeof (quickviewExtraCode) === 'function') {
            quickviewExtraCode();
        }

        // hide item code if empty
        if ($('#wrap_quickview #item_details .code_item').text().trim() == '') {
            $('#wrap_quickview #item_details .code_item').hide();
        }

        // link to item
        if ($("#wrap_quickview .item_main_bottom_left").length > 0) {
            $("#wrap_quickview .item_main_bottom_left").append(linkItem);
        } else {
            $("#wrap_quickview #item_details").append(linkItem); // classic shops
        }
        $('#wrap_quickview .quickview_item_link').attr('href', itemUrl);

        // contact now
        $("#wrap_quickview #item_link_buy_now .contactNow a").text("צור קשר");

        quickviewAdminFieldsChanges();
        if (storeLayout ? .indexOf("responsive") == -1 || storeLayout == undefined) {
            quickviewChangesClassic();
        }
        sortUpgradesToShow();
        quickviewStrengthsChanges();
        quickviewInventoryChanges();


    } catch (error) {
        console.log("TCL: generalChangesInQuickview -> error", error);
    }
}

const quickviewChangesClassic = () => {
    // item_main_top
    if ($("#wrap_quickview #item_details .item_main_top").length == 0) {
        $("#wrap_quickview #item_details").prepend("<div class='item_main_top'></div>");
        $("#wrap_quickview #item_details .item_main_top").append($("#wrap_quickview #item_current_title"));
        $("#wrap_quickview #item_details .item_main_top").append($("#wrap_quickview #item_current_sub_title"));
        $("#wrap_quickview #item_details .item_main_top").append($("#wrap_quickview .sub_title_read_more_wrap"));
        $("#wrap_quickview #item_details .item_main_top").append($("#wrap_quickview #item_anchors"));
    }

    // item_main_bottom
    if ($("#wrap_quickview #item_details .item_main_bottom").length == 0) {
        $("#wrap_quickview #item_details").append("<div class='item_main_bottom'></div>");
        $("#wrap_quickview #item_details .item_main_bottom").append("<div class='item_main_bottom_right'></div><div class='item_main_bottom_left'></div>");

        // item_main_bottom_right
        $("#wrap_quickview .item_main_bottom_right").append("<div class='wrap_show_upgrades_top'></div><div class='main_price_and_btn'></div><div class='wrap_shipping_warranty_delivery'></div>");

        if ($(".special_cart_wrapper").length == 0) {
            $("#wrap_quickview .item_main_bottom_right .main_price_and_btn").append("<div class='wrap_price'></div><div class='special_cart_wrapper'></div>");
        } else {
            $("#wrap_quickview .item_main_bottom_right .main_price_and_btn").append("<div class='wrap_price'></div>");
            $("#wrap_quickview .item_main_bottom_right .main_price_and_btn").append($(".special_cart_wrapper"));
        }
        $("#wrap_quickview .item_main_bottom_right .wrap_show_upgrades_top").append($("#wrap_quickview #item_upgrades_top"));
        $("#wrap_quickview .item_main_bottom_right .wrap_price").append($("#wrap_quickview #item_show_price"));
        $("#wrap_quickview .item_main_bottom_right .wrap_price").append($("#wrap_quickview .item_show_origin_price"));
        $("#wrap_quickview .item_main_bottom_right .wrap_shipping_warranty_delivery").append($("#wrap_quickview #shipping_warranty_delivery"));

        $("#wrap_quickview .item_main_bottom_right .special_cart_wrapper").append($("#wrap_quickview .product_quantity"));
        $("#wrap_quickview .item_main_bottom_right .special_cart_wrapper").append($("#wrap_quickview .fake_quantity"));
        $("#wrap_quickview .item_main_bottom_right .special_cart_wrapper").append($("#wrap_quickview #item_link_buy_now"));
        $("#wrap_quickview .item_main_bottom_right .special_cart_wrapper").append($(".zero_val_comment"));


        // item_main_bottom_left
        $("#wrap_quickview .item_main_bottom_left").append($("#wrap_quickview #item_current_content"));
        $("#wrap_quickview .item_main_bottom_left").append($("#wrap_quickview .link_ask_about_item"));

        $("#wrap_quickview .item_main_bottom_left").append("<div class='extra_icons'></div>");
        $("#wrap_quickview .extra_icons").append($("#wrap_quickview #item_safe_buy"));
        $("#wrap_quickview .extra_icons").append($("#wrap_quickview .truck"));

        $("#wrap_quickview .item_main_bottom_left").append($("#wrap_quickview .link_wrapper"));

        // remove wrap_content_top (there is no wrapper in classic)
        // !!!! pay attention at the other versions
        $("#wrap_quickview #item_details > div:not(.item_main_top):not(.item_main_bottom):not(.link_wrapper), #wrap_quickview #item_details > span").remove();
        $("#wrap_quickview #item_group1").remove();

    }
}

const classicGallery = () => {
    try {
        var mode = document.documentMode || 0;
        var isIE6 = $.browser ? .msie && /MSIE 6.0/.test(navigator.userAgent) && !mode;
        var changeDependencyByVal = null;

        (function ($) {
            var tmp, loading, overlay, wrap, outer, inner, close, nav_left, nav_right, selectedIndex = 0,
                selectedOpts = {},
                selectedArray = [],
                currentIndex = 0,
                currentOpts = {},
                currentArray = [],
                ajaxLoader = null,
                imgPreloader = new Image(),
                imgRegExp = /\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,
                swfRegExp = /[^\.]\.(swf)\s*$/i,
                loadingTimer, loadingFrame = 1,
                start_pos, final_pos, busy = false,
                shadow = 20,
                fx = $.extend($('<div/>')[0], {
                    prop: 0
                }),
                titleh = 0,
                isIE6 = !$.support.opacity && !window.XMLHttpRequest,
                fancybox_abort = function () {
                    loading.hide();
                    imgPreloader.onerror = imgPreloader.onload = null;
                    if (ajaxLoader) {
                        ajaxLoader.abort()
                    }
                    tmp.empty()
                },
                fancybox_error = function () {
                    $.fancybox('<p id="fancybox_error">The requested content cannot be loaded.<br />Please try again later.</p>', {
                        'scrolling': 'no',
                        'padding': 20,
                        'transitionIn': 'none',
                        'transitionOut': 'none'
                    })
                },
                fancybox_get_viewport = function () {
                    return [$(window).width(), $(window).height(), $(document).scrollLeft(), $(document).scrollTop()]
                },
                fancybox_get_zoom_to = function () {
                    var view = fancybox_get_viewport(),
                        to = {},
                        margin = currentOpts.margin,
                        resize = currentOpts.autoScale,
                        horizontal_space = (shadow + margin) * 2,
                        vertical_space = (shadow + margin) * 2,
                        double_padding = (currentOpts.padding * 2),
                        ratio;
                    if (currentOpts.width.toString().indexOf('%') > -1) {
                        to.width = ((view[0] * parseFloat(currentOpts.width)) / 100) - (shadow * 2);
                        resize = false
                    } else {
                        to.width = currentOpts.width + double_padding
                    }
                    if (currentOpts.height.toString().indexOf('%') > -1) {
                        to.height = ((view[1] * parseFloat(currentOpts.height)) / 100) - (shadow * 2);
                        resize = false
                    } else {
                        to.height = currentOpts.height + double_padding
                    }
                    if (resize && (to.width > (view[0] - horizontal_space) || to.height > (view[1] - vertical_space))) {
                        if (selectedOpts.type == 'image' || selectedOpts.type == 'swf') {
                            horizontal_space += double_padding;
                            vertical_space += double_padding;
                            ratio = Math.min(Math.min(view[0] - horizontal_space, currentOpts.width) / currentOpts.width, Math.min(view[1] - vertical_space, currentOpts.height) / currentOpts.height);
                            to.width = Math.round(ratio * (to.width - double_padding)) + double_padding;
                            to.height = Math.round(ratio * (to.height - double_padding)) + double_padding
                        } else {
                            to.width = Math.min(to.width, (view[0] - horizontal_space));
                            to.height = Math.min(to.height, (view[1] - vertical_space))
                        }
                    }
                    to.top = view[3] + ((view[1] - (to.height + (shadow * 2))) * 0.5);
                    to.left = view[2] + ((view[0] - (to.width + (shadow * 2))) * 0.5);
                    if (currentOpts.autoScale === false) {
                        to.top = Math.max(view[3] + margin, to.top);
                        to.left = Math.max(view[2] + margin, to.left)
                    }
                    return to
                },
                fancybox_format_title = function (title) {
                    if (title && title.length) {
                        switch (currentOpts.titlePosition) {
                            case 'inside':
                                return title;
                            case 'over':
                                return '<span id="fancybox-title-over">' + title + '</span>';
                            default:
                                return currentIndex + 1 + ' / ' + currentArray.length
                        }
                    }
                    return false
                },
                fancybox_process_title = function () {
                    var title = currentOpts.title,
                        width = final_pos.width - (currentOpts.padding * 2),
                        titlec = 'fancybox-title-' + currentOpts.titlePosition;
                    $('#fancybox-title').remove();
                    titleh = 0;
                    if (currentOpts.titleShow === false) {
                        return
                    }
                    title = $.isFunction(currentOpts.titleFormat) ? currentOpts.titleFormat(title, currentArray, currentIndex, currentOpts) : fancybox_format_title(title);
                    $('#imageNumber').remove();
                    $('<div id="imageNumber" />').html(title).appendTo('#fancybox-wrap');
                    switch (currentOpts.titlePosition) {
                        case 'inside':
                            titleh = $("#fancybox-title").outerHeight(true) - currentOpts.padding;
                            final_pos.height += titleh;
                            break;
                        case 'over':
                            $('#fancybox-title').css('bottom', currentOpts.padding);
                            break;
                        default:
                            $('#fancybox-title').css('bottom', $("#fancybox-title").outerHeight(true) * -1);
                            break
                    }
                    $('#fancybox-title').appendTo(outer).hide()
                },
                fancybox_set_navigation = function () {
                    $(document).unbind('keydown.fb').bind('keydown.fb', function (e) {
                        if (e.keyCode == 27 && currentOpts.enableEscapeButton) {
                            e.preventDefault();
                            $.fancybox.close()
                        } else if (e.keyCode == 37) {
                            e.preventDefault();
                            $.fancybox.prev()
                        } else if (e.keyCode == 39) {
                            e.preventDefault();
                            $.fancybox.next()
                        }
                    });
                    if ($.fn.mousewheel) {
                        wrap.unbind('mousewheel.fb');
                        if (currentArray.length > 1) {
                            wrap.bind('mousewheel.fb', function (e, delta) {
                                e.preventDefault();
                                if (busy || delta === 0) {
                                    return
                                }
                                if (delta > 0) {
                                    $.fancybox.prev()
                                } else {
                                    $.fancybox.next()
                                }
                            })
                        }
                    }
                    if (!currentOpts.showNavArrows) {
                        return
                    }
                    if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex !== 0) {
                        nav_left.show()
                    }
                    if ((currentOpts.cyclic && currentArray.length > 1) || currentIndex != (currentArray.length - 1)) {
                        nav_right.show()
                    }
                },
                fancybox_preload_images = function () {
                    var href, objNext;
                    if ((currentArray.length - 1) > currentIndex) {
                        href = currentArray[currentIndex + 1].href;
                        if (typeof href !== 'undefined' && href.match(imgRegExp)) {
                            objNext = new Image();
                            objNext.src = href
                        }
                    }
                    if (currentIndex > 0) {
                        href = currentArray[currentIndex - 1].href;
                        if (typeof href !== 'undefined' && href.match(imgRegExp)) {
                            objNext = new Image();
                            objNext.src = href
                        }
                    }
                },
                _finish = function () {
                    inner.css('overflow', (currentOpts.scrolling == 'auto' ? (currentOpts.type == 'image' || currentOpts.type == 'iframe' || currentOpts.type == 'swf' ? 'hidden' : 'auto') : (currentOpts.scrolling == 'yes' ? 'auto' : 'visible')));
                    if (!$.support.opacity) {
                        inner.get(0).style.removeAttribute('filter');
                        wrap.get(0).style.removeAttribute('filter')
                    }
                    $('#fancybox-title').show();
                    if (currentOpts.hideOnContentClick) {
                        inner.one('click', $.fancybox.close)
                    }
                    if (currentOpts.hideOnOverlayClick) {
                        overlay.one('click', $.fancybox.close)
                    }
                    if (currentOpts.showCloseButton) {
                        close.show()
                    }
                    fancybox_set_navigation();
                    $(window).bind("resize.fb", $.fancybox.center);
                    if (currentOpts.centerOnScroll) {
                        $(window).bind("scroll.fb", $.fancybox.center)
                    } else {
                        $(window).unbind("scroll.fb")
                    }
                    if ($.isFunction(currentOpts.onComplete)) {
                        currentOpts.onComplete(currentArray, currentIndex, currentOpts)
                    }
                    busy = false;
                    fancybox_preload_images()
                },
                fancybox_draw = function (pos) {
                    var width = Math.round(start_pos.width + (final_pos.width - start_pos.width) * pos),
                        height = Math.round(start_pos.height + (final_pos.height - start_pos.height) * pos),
                        top = Math.round(start_pos.top + (final_pos.top - start_pos.top) * pos),
                        left = Math.round(start_pos.left + (final_pos.left - start_pos.left) * pos);
                    wrap.css({
                        'width': width + 'px',
                        'height': height + 'px',
                        'top': top + 'px',
                        'left': left + 'px'
                    });
                    width = Math.max(width - currentOpts.padding * 2, 0);
                    height = Math.max(height - (currentOpts.padding * 2 + (titleh * pos)), 0);
                    inner.css({
                        'width': width + 'px',
                        'height': height + 'px'
                    });
                    if (typeof final_pos.opacity !== 'undefined') {
                        wrap.css('opacity', (pos < 0.5 ? 0.5 : pos))
                    }
                },
                fancybox_get_obj_pos = function (obj) {
                    var pos = obj.offset();
                    pos.top += parseFloat(obj.css('paddingTop')) || 0;
                    pos.left += parseFloat(obj.css('paddingLeft')) || 0;
                    pos.top += parseFloat(obj.css('border-top-width')) || 0;
                    pos.left += parseFloat(obj.css('border-left-width')) || 0;
                    pos.width = obj.width();
                    pos.height = obj.height();
                    return pos
                },
                fancybox_get_zoom_from = function () {
                    var orig = selectedOpts.orig ? $(selectedOpts.orig) : false,
                        from = {},
                        pos, view;
                    if (orig && orig.length) {
                        pos = fancybox_get_obj_pos(orig);
                        from = {
                            width: (pos.width + (currentOpts.padding * 2)),
                            height: (pos.height + (currentOpts.padding * 2)),
                            top: (pos.top - currentOpts.padding - shadow),
                            left: (pos.left - currentOpts.padding - shadow)
                        }
                    } else {
                        view = fancybox_get_viewport();
                        from = {
                            width: 1,
                            height: 1,
                            top: view[3] + view[1] * 0.5,
                            left: view[2] + view[0] * 0.5
                        }
                    }
                    return from
                },
                fancybox_show = function () {
                    loading.hide();
                    if (wrap.is(":visible") && $.isFunction(currentOpts.onCleanup)) {
                        if (currentOpts.onCleanup(currentArray, currentIndex, currentOpts) === false) {
                            $.event.trigger('fancybox-cancel');
                            busy = false;
                            return
                        }
                    }
                    currentArray = selectedArray;
                    currentIndex = selectedIndex;
                    currentOpts = selectedOpts;
                    inner.get(0).scrollTop = 0;
                    inner.get(0).scrollLeft = 0;
                    if (currentOpts.overlayShow) {
                        if (isIE6) {
                            $('select:not(#fancybox-tmp select)').filter(function () {
                                return this.style.visibility !== 'hidden'
                            }).css({
                                'visibility': 'hidden'
                            }).one('fancybox-cleanup', function () {
                                this.style.visibility = 'inherit'
                            })
                        }
                        overlay.css({
                            'background-color': currentOpts.overlayColor,
                            'opacity': currentOpts.overlayOpacity
                        }).unbind().show()
                    }
                    final_pos = fancybox_get_zoom_to();
                    fancybox_process_title();
                    if (wrap.is(":visible")) {
                        $(close.add(nav_left).add(nav_right)).hide();
                        var pos = wrap.position(),
                            equal;
                        start_pos = {
                            top: pos.top,
                            left: pos.left,
                            width: wrap.width(),
                            height: wrap.height()
                        };
                        equal = (start_pos.width == final_pos.width && start_pos.height == final_pos.height);
                        inner.fadeOut(currentOpts.changeFade, function () {
                            var finish_resizing = function () {
                                inner.html(tmp.contents()).fadeIn(currentOpts.changeFade, _finish)
                            };
                            $.event.trigger('fancybox-change');
                            inner.empty().css('overflow', 'hidden');
                            if (equal) {
                                inner.css({
                                    top: currentOpts.padding,
                                    left: currentOpts.padding,
                                    width: Math.max(final_pos.width - (currentOpts.padding * 2), 1),
                                    height: Math.max(final_pos.height - (currentOpts.padding * 2) - titleh, 1)
                                });
                                finish_resizing()
                            } else {
                                inner.css({
                                    top: currentOpts.padding,
                                    left: currentOpts.padding,
                                    width: Math.max(start_pos.width - (currentOpts.padding * 2), 1),
                                    height: Math.max(start_pos.height - (currentOpts.padding * 2), 1)
                                });
                                fx.prop = 0;
                                $(fx).animate({
                                    prop: 1
                                }, {
                                    duration: currentOpts.changeSpeed,
                                    easing: currentOpts.easingChange,
                                    step: fancybox_draw,
                                    complete: finish_resizing
                                })
                            }
                        });
                        return
                    }
                    wrap.css('opacity', 1);
                    if (currentOpts.transitionIn == 'elastic') {
                        start_pos = fancybox_get_zoom_from();
                        inner.css({
                            top: currentOpts.padding,
                            left: currentOpts.padding,
                            width: Math.max(start_pos.width - (currentOpts.padding * 2), 1),
                            height: Math.max(start_pos.height - (currentOpts.padding * 2), 1)
                        }).html(tmp.contents());
                        wrap.css(start_pos).show();
                        if (currentOpts.opacity) {
                            final_pos.opacity = 0
                        }
                        fx.prop = 0;
                        $(fx).animate({
                            prop: 1
                        }, {
                            duration: currentOpts.speedIn,
                            easing: currentOpts.easingIn,
                            step: fancybox_draw,
                            complete: _finish
                        })
                    } else {
                        inner.css({
                            top: currentOpts.padding,
                            left: currentOpts.padding,
                            width: Math.max(final_pos.width - (currentOpts.padding * 2), 1),
                            height: Math.max(final_pos.height - (currentOpts.padding * 2) - titleh, 1)
                        }).html(tmp.contents());
                        wrap.css(final_pos).fadeIn(currentOpts.transitionIn == 'none' ? 0 : currentOpts.speedIn, _finish)
                    }
                },
                fancybox_process_inline = function () {
                    if (selectedOpts.width == 'auto') {
                        selectedOpts.width = tmp.width()
                    }
                    if (selectedOpts.height == 'auto') {
                        selectedOpts.height = tmp.height()
                    }
                    fancybox_show()
                },
                fancybox_process_image = function () {
                    busy = true;
                    var div = $('<div id="img"></div>');
                    var img = $("<img />").attr({
                        'id': 'fancybox-img',
                        'src': imgPreloader.src,
                        'alt': selectedOpts.title
                    });
                    img.appendTo(div);
                    div.appendTo(tmp);
                    if (imgPreloader.width > 500) {
                        $('#fancybox-img').width(500);
                        $('#fancybox-img').height('auto')
                    } else {
                        $('#fancybox-img').width('auto');
                        if (imgPreloader.height > 500) {
                            $('#fancybox-img').height(500)
                        }
                    }
                    if (badBrowser) {
                        $('#fancybox-img').css({
                            display: 'none'
                        }).vAlign()
                    }
                    fancybox_show()
                },
                fancybox_start = function () {
                    fancybox_abort();
                    var obj = selectedArray[selectedIndex],
                        href, type, title, str, emb, selector, data;
                    selectedOpts = $.extend({}, $.fn.fancybox.defaults, (typeof $(obj).data('fancybox') == 'undefined' ? selectedOpts : $(obj).data('fancybox')));
                    title = obj.title || $(obj).title || selectedOpts.title || '';
                    if (obj.nodeName && !selectedOpts.orig) {
                        selectedOpts.orig = $(obj).children("img:first").length ? $(obj).children("img:first") : $(obj)
                    }
                    if (title === '' && selectedOpts.orig) {
                        title = selectedOpts.orig.attr('alt')
                    }
                    if (obj.nodeName && (/^(?:javascript|#)/i).test(obj.href)) {
                        href = selectedOpts.href || null
                    } else {
                        href = selectedOpts.href || obj.href || null
                    }
                    if (selectedOpts.type) {
                        type = selectedOpts.type;
                        if (!href) {
                            href = selectedOpts.content
                        }
                    } else if (selectedOpts.content) {
                        type = 'html'
                    } else if (href) {
                        if (href.match(imgRegExp)) {
                            type = 'image'
                        } else if (href.match(swfRegExp)) {
                            type = 'swf'
                        } else if ($(obj).hasClass("iframe")) {
                            type = 'iframe'
                        } else if (href.match(/#/)) {
                            obj = href.substr(href.indexOf("#"));
                            type = $(obj).length > 0 ? 'inline' : 'ajax'
                        } else {
                            type = 'ajax'
                        }
                    } else {
                        type = 'inline'
                    }
                    selectedOpts.type = type;
                    selectedOpts.href = href;
                    selectedOpts.title = title;
                    if (selectedOpts.autoDimensions && selectedOpts.type !== 'iframe' && selectedOpts.type !== 'swf') {
                        selectedOpts.width = 'auto';
                        selectedOpts.height = 'auto'
                    }
                    if (selectedOpts.modal) {
                        selectedOpts.overlayShow = true;
                        selectedOpts.hideOnOverlayClick = false;
                        selectedOpts.hideOnContentClick = false;
                        selectedOpts.enableEscapeButton = false;
                        selectedOpts.showCloseButton = false
                    }
                    if ($.isFunction(selectedOpts.onStart)) {
                        if (selectedOpts.onStart(selectedArray, selectedIndex, selectedOpts) === false) {
                            busy = false;
                            return
                        }
                    }
                    tmp.css('padding', (shadow + selectedOpts.padding + selectedOpts.margin));
                    $('.fancybox-inline-tmp').unbind('fancybox-cancel').bind('fancybox-change', function () {
                        $(this).replaceWith(inner.children())
                    });
                    switch (type) {
                        case 'html':
                            tmp.html(selectedOpts.content);
                            fancybox_process_inline();
                            break;
                        case 'inline':
                            $('<div class="fancybox-inline-tmp" />').hide().insertBefore($(obj)).bind('fancybox-cleanup', function () {
                                $(this).replaceWith(inner.children())
                            }).bind('fancybox-cancel', function () {
                                $(this).replaceWith(tmp.children())
                            });
                            $(obj).appendTo(tmp);
                            fancybox_process_inline();
                            break;
                        case 'image':
                            busy = false;
                            $.fancybox.showActivity();
                            imgPreloader = new Image();
                            imgPreloader.onerror = function () {
                                fancybox_error()
                            };
                            imgPreloader.onload = function () {
                                imgPreloader.onerror = null;
                                imgPreloader.onload = null;
                                fancybox_process_image();
                                if ($('#fancybox-img').outerWidth(false) > 500) {
                                    $('#fancybox-img').width(500);
                                    $('#fancybox-img').height('auto')
                                }
                            };
                            imgPreloader.src = href;
                            break;
                        case 'swf':
                            str = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + selectedOpts.width + '" height="' + selectedOpts.height + '"><param name="movie" value="' + href + '"></param>';
                            emb = '';
                            $.each(selectedOpts.swf, function (name, val) {
                                str += '<param name="' + name + '" value="' + val + '"></param>';
                                emb += ' ' + name + '="' + val + '"'
                            });
                            str += "<embed src='" + href + "' type='application/x-shockwave-flash' width='" + selectedOpts.width + "' height='" + selectedOpts.height + "'" + emb + "></embed></object>";
                            tmp.html(str);
                            fancybox_process_inline();
                            break;
                        case 'div':
                            fancybox_show();
                            break;
                        case 'ajax':
                            selector = href.split('#', 2);
                            data = selectedOpts.ajax.data || {};
                            if (selector.length > 1) {
                                href = selector[0];
                                if (typeof data == "string") {
                                    data += '&selector=' + selector[1]
                                } else {
                                    data.selector = selector[1]
                                }
                            }
                            busy = false;
                            $.fancybox.showActivity();
                            ajaxLoader = $.ajax($.extend(selectedOpts.ajax, {
                                url: href,
                                data: data,
                                error: fancybox_error,
                                success: function (data, textStatus, XMLHttpRequest) {
                                    if (ajaxLoader.status == 200) {
                                        tmp.html(data);
                                        fancybox_process_inline()
                                    }
                                }
                            }));
                            break;
                        case 'iframe':
                            $('<iframe id="fancybox-frame" name="fancybox-frame' + new Date().getTime() + '" frameborder="0" hspace="0" scrolling="' + selectedOpts.scrolling + "' src='" + selectedOpts.href + "'></iframe>").appendTo(tmp);
                            fancybox_show();
                            break
                    }
                },
                fancybox_animate_loading = function () {
                    if (!loading.is(':visible')) {
                        clearInterval(loadingTimer);
                        return
                    }
                    $('div', loading).css('top', (loadingFrame * -40) + 'px');
                    loadingFrame = (loadingFrame + 1) % 12
                },
                fancybox_init = function () {
                    if ($("#fancybox-wrap").length) {
                        return
                    }
                    $('body').append(tmp = $('<div id="fancybox-tmp"></div>'), loading = $('<div id="fancybox-loading"><div></div></div>'), overlay = $('<div id="fancybox-overlay"></div>'), wrap = $('<div id="fancybox-wrap"></div>'));
                    if (!$.support.opacity) {
                        wrap.addClass('fancybox-ie');
                        loading.addClass('fancybox-ie')
                    }
                    outer = $('<div id="fancybox-outer"></div>').append('<div class="fancy-bg" id="fancy-bg-n"></div><div class="fancy-bg" id="fancy-bg-ne"></div><div class="fancy-bg" id="fancy-bg-e"></div><div class="fancy-bg" id="fancy-bg-se"></div><div class="fancy-bg" id="fancy-bg-s"></div><div class="fancy-bg" id="fancy-bg-sw"></div><div class="fancy-bg" id="fancy-bg-w"></div><div class="fancy-bg" id="fancy-bg-nw"></div>').appendTo(wrap);
                    outer.append(inner = $('<div id="fancybox-inner"></div>'), close = $('<a id="fancybox-close"></a>'), nav_left = $('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'), nav_right = $('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));
                    close.click($.fancybox.close);
                    loading.click($.fancybox.cancel);
                    nav_left.click(function (e) {
                        e.preventDefault();
                        $.fancybox.prev()
                    });
                    nav_right.click(function (e) {
                        e.preventDefault();
                        $.fancybox.next()
                    });
                    if (isIE6) {
                        overlay.get(0).style.setExpression('height', "document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + 'px'");
                        loading.get(0).style.setExpression('top', "(-20 + (document.documentElement.clientHeight ? document.documentElement.clientHeight/2 : document.body.clientHeight/2 ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop )) + 'px'");
                        outer.prepend("<iframe id='fancybox-hide-sel-frame' src='javascript:\"\";' scrolling='no' frameborder='0' ></iframe>")
                    }
                };
            $.fn.fancybox = function (options) {
                $(this).data('fancybox', $.extend({}, options, ($.metadata ? $(this).metadata() : {}))).unbind('click.fb').bind('click.fb', function (e) {
                    e.preventDefault();
                    if (busy) {
                        return
                    }
                    busy = true;
                    $(this).blur();
                    selectedArray = [];
                    selectedIndex = 0;
                    var rel = $(this).attr('rel') || '';
                    if (!rel || rel == '' || rel === 'nofollow') {
                        selectedArray.push(this)
                    } else {
                        selectedArray = $("a[rel=" + rel + "], area[rel=" + rel + "]");
                        selectedIndex = selectedArray.index(this)
                    }
                    fancybox_start();
                    return false
                });
                return this
            };
            $.fancybox = function (obj) {
                if (busy) {
                    return
                }
                busy = true;
                var opts = typeof arguments[1] !== 'undefined' ? arguments[1] : {};
                selectedArray = [];
                selectedIndex = opts.index || 0;
                if ($.isArray(obj)) {
                    for (var i = 0, j = obj.length; i < j; i++) {
                        if (typeof obj[i] == 'object') {
                            $(obj[i]).data('fancybox', $.extend({}, opts, obj[i]))
                        } else {
                            obj[i] = $({}).data('fancybox', $.extend({
                                content: obj[i]
                            }, opts))
                        }
                    }
                    selectedArray = jQuery.merge(selectedArray, obj)
                } else {
                    if (typeof obj == 'object') {
                        $(obj).data('fancybox', $.extend({}, opts, obj))
                    } else {
                        obj = $({}).data('fancybox', $.extend({
                            content: obj
                        }, opts))
                    }
                    selectedArray.push(obj)
                }
                if (selectedIndex > selectedArray.length || selectedIndex < 0) {
                    selectedIndex = 0
                }
                fancybox_start()
            };
            $.fancybox.showActivity = function () {
                clearInterval(loadingTimer);
                loading.show();
                loadingTimer = setInterval(fancybox_animate_loading, 66)
            };
            $.fancybox.hideActivity = function () {
                loading.hide()
            };
            $.fancybox.next = function () {
                return $.fancybox.pos(currentIndex + 1)
            };
            $.fancybox.prev = function () {
                return $.fancybox.pos(currentIndex - 1)
            };
            $.fancybox.pos = function (pos) {
                if (busy) {
                    return
                }
                pos = parseInt(pos, 10);
                if (pos > -1 && currentArray.length > pos) {
                    selectedIndex = pos;
                    fancybox_start()
                }
                if (currentOpts.cyclic && currentArray.length > 1 && pos < 0) {
                    selectedIndex = currentArray.length - 1;
                    fancybox_start()
                }
                if (currentOpts.cyclic && currentArray.length > 1 && pos >= currentArray.length) {
                    selectedIndex = 0;
                    fancybox_start()
                }
                return
            };
            $.fancybox.cancel = function () {
                if (busy) {
                    return
                }
                busy = true;
                $.event.trigger('fancybox-cancel');
                fancybox_abort();
                if (selectedOpts && $.isFunction(selectedOpts.onCancel)) {
                    selectedOpts.onCancel(selectedArray, selectedIndex, selectedOpts)
                }
                busy = false
            };
            $.fancybox.close = function () {
                if (busy || wrap.is(':hidden')) {
                    return
                }
                busy = true;
                if (currentOpts && $.isFunction(currentOpts.onCleanup)) {
                    if (currentOpts.onCleanup(currentArray, currentIndex, currentOpts) === false) {
                        busy = false;
                        return
                    }
                }
                fancybox_abort();
                $(close.add(nav_left).add(nav_right)).hide();
                $('#fancybox-title').remove();
                wrap.add(inner).add(overlay).unbind();
                $(window).unbind("resize.fb scroll.fb");
                $(document).unbind('keydown.fb');

                function _cleanup() {
                    overlay.fadeOut('fast');
                    wrap.hide();
                    $.event.trigger('fancybox-cleanup');
                    inner.empty();
                    if ($.isFunction(currentOpts.onClosed)) {
                        currentOpts.onClosed(currentArray, currentIndex, currentOpts)
                    }
                    currentArray = selectedOpts = [];
                    currentIndex = selectedIndex = 0;
                    currentOpts = selectedOpts = {};
                    busy = false
                }
                inner.css('overflow', 'hidden');
                if (currentOpts.transitionOut == 'elastic') {
                    start_pos = fancybox_get_zoom_from();
                    var pos = wrap.position();
                    final_pos = {
                        top: pos.top,
                        left: pos.left,
                        width: wrap.width(),
                        height: wrap.height()
                    };
                    if (currentOpts.opacity) {
                        final_pos.opacity = 1
                    }
                    fx.prop = 1;
                    $(fx).animate({
                        prop: 0
                    }, {
                        duration: currentOpts.speedOut,
                        easing: currentOpts.easingOut,
                        step: fancybox_draw,
                        complete: _cleanup
                    })
                } else {
                    wrap.fadeOut(currentOpts.transitionOut == 'none' ? 0 : currentOpts.speedOut, _cleanup)
                }
            };
            $.fancybox.resize = function () {
                var c, h;
                if (busy || wrap.is(':hidden')) {
                    return
                }
                busy = true;
                c = inner.wrapInner("<div style='overflow:auto'></div>").children();
                h = c.height();
                wrap.css({
                    height: h + (currentOpts.padding * 2) + titleh
                });
                inner.css({
                    height: h
                });
                c.replaceWith(c.children());
                $.fancybox.center()
            };
            $.fancybox.center = function () {
                busy = true;
                var view = fancybox_get_viewport(),
                    margin = currentOpts.margin,
                    to = {};
                to.top = view[3] + ((view[1] - ((wrap.height() - titleh) + (shadow * 2))) * 0.5);
                to.left = view[2] + ((view[0] - (wrap.width() + (shadow * 2))) * 0.5);
                to.top = Math.max(view[3] + margin, to.top);
                to.left = Math.max(view[2] + margin, to.left);
                wrap.css(to);
                busy = false
            };
            $.fn.fancybox.defaults = {
                padding: 10,
                margin: 20,
                opacity: false,
                modal: false,
                cyclic: false,
                scrolling: 'auto',
                width: 500,
                height: 900,
                autoScale: true,
                autoDimensions: true,
                centerOnScroll: false,
                ajax: {},
                swf: {
                    wmode: 'transparent'
                },
                hideOnOverlayClick: true,
                hideOnContentClick: false,
                overlayShow: true,
                overlayOpacity: 0.3,
                overlayColor: '#666',
                titleShow: false,
                titlePosition: 'outside',
                titleFormat: null,
                transitionIn: 'fade',
                transitionOut: 'fade',
                speedIn: 300,
                speedOut: 300,
                changeSpeed: 300,
                changeFade: 'fast',
                easingIn: 'swing',
                easingOut: 'swing',
                showCloseButton: true,
                showNavArrows: true,
                enableEscapeButton: true,
                onStart: null,
                onCancel: null,
                onComplete: null,
                onCleanup: null,
                onClosed: null
            };
            $(document).ready(function () {
                fancybox_init()
            })
        })(jQuery);

        carouselFunc(); // init top carousel (as a regular carousel)
        $('#productCarouselHook')
            .find('a').click(carouselFunc).end()
            .next().children('a').click(carouselFunc); // bind top carousel events


        $('#productCarouselHook').prev().children('a').fancybox({ // bind fancybox to the top carousel
            'titleShow': true,
            'cyclic': true,
            'overlayOpacity': 0.6,
            'overlayColor': '#000',
            'autoDimensions': false,
            'autoScale': false,
            'width': 900,
            'height': 500,
            'onStart': function () {
                if (badBrowser) {
                    $('#fancybox-img').css({
                        display: 'none'
                    });
                }
            },
            'onComplete': function () {
                if (badBrowser) {
                    $('#fancybox-img').vAlign().css({
                        display: 'block'
                    });
                }
            }
        });
    } catch (error) {
        console.log("classicGallery function error -> ", error);

    }

    function carouselFunc() {
        var $this = $(this), // a.prevImg or a.nextImg, must be only siblings
            $pHook = $('#productCarouselHook'), // top carousel shortcut
            $pWrap = $pHook.children('div'), // product wrapping div shortcut - thumbnails inner anonymous <div> container which must come previouse to $this controls container
            $items = $pWrap.children(), // $array shortcut of all the actual items <a>
            animationSpeed = 500,
            numberOfThumbnails = $items.length,
            visibleThumbnails = 4,
            singleThumbnailWidth = $items.filter(':first').outerWidth(true), // true = include margin
            maxCarouselWidth = (numberOfThumbnails - visibleThumbnails) * singleThumbnailWidth;

        if (this === window) { // init
            $pWrap
                .width($items.filter(':first').outerWidth(true) * $items.length)
                .data('pos', 0); // init data currentPositionCell with 0

            $(window).load(function () { // do this after everything has loaded
                $pWrap
                    .css({
                        left: 0
                    }) // only after all images have loaded: show it
                    .find('img').filter(function () {
                        return $(this).height() < 55
                    }).vAlign(); // auto-align to verticle-center of all small images
            });
        } //close if window

        if (numberOfThumbnails <= 4) {
            $pHook.next().children().hide();
        } // if there aren't enough items to scroll = hide arrows.

        //next
        if ($this.hasClass('nextImg') && !$pWrap.is(':animated')) {
            pos = $pWrap.data().pos = $pWrap.data().pos + singleThumbnailWidth;

            if (pos >= maxCarouselWidth) {
                if ($.browser.msie) {
                    $this.hide();
                } else {
                    $this.hide('slow');
                }
            }
            if (pos > maxCarouselWidth) pos -= singleThumbnailWidth;
            if ($this.siblings('a').is(':hidden')) {
                if ($.browser.msie) {
                    $this.siblings().show();
                } else {
                    $this.siblings().show('slow');
                }
            }
            $pWrap.animate({
                left: pos * -1
            }, animationSpeed); // main animation happens here
        }
        //prev
        if ($this.hasClass('prevImg') && !$pWrap.is(':animated')) {
            pos = $pWrap.data().pos = $pWrap.data().pos - singleThumbnailWidth;

            if (pos < 0) pos = 0;
            if (pos <= 0) {
                if ($.browser.msie) {
                    $this.hide();
                } else {
                    $this.hide('slow');
                }
            }
            if ($this.siblings().is(':hidden')) {
                if ($.browser.msie) {
                    $this.siblings().show();
                } else {
                    $this.siblings().show('slow');
                }
            }
            $pWrap.animate({
                left: pos * -1
            }, animationSpeed); // main animation happens here
        } //close if prevImg		

        //click		
        if ($this.parent().parent().attr('id') === 'productCarouselHook') { // if the user clicked a thumbnail to choose the main image
            var $this = $(this); //$('#productCarouselHook a')
            $this.attr("href", "#");
            selectedID = $this.prevAll().length;

            $this.siblings().removeClass('active').end().addClass('active'); // show border
            var $mainImage = $this.parent().parent().prev().children('a').eq(selectedID); // $('div.mainImage a')
            //carousel$.log('$mainImage = '+ $mainImage.prevAll().length);//carousel
            $mainImage.siblings().removeClass('active').end().addClass('active'); // show Medium image by adding active
            if ($mainImage.children('b').length === 1) { // seperate the sun from the rest of the link + update the inner text from the text inside the link dynamically
                $mainImage
                    .siblings('big').remove().end()
                    .after('<big/>').siblings('big').css({
                        display: 'block'
                    }).html($mainImage.children('b').html());
            } else {
                $mainImage.siblings('big').remove();
            }
            if (isIE6)
                $mainImage.find('img').imageResize({
                    height: 210,
                    width: 280
                });
            //if(badBrowser) $mainImage.children().vAlign(); //comment this for fixing the sun error
        }
    } //end top/regular carousel



}

// admin fields liquids
const quickviewAdminFieldsChanges = () => {
    // if quantity => class zero_quantity
    if ((htmlData.split('<body class="')[1] && htmlData.split('<body class="')[1].split('"')[0].indexOf('quantity_false') > -1) || htmlData.split('<body\r\n  class="')[1] ? .split('"')[0].indexOf('quantity_false') > -1) {
        // if (data.split('<body class="')[1].split('"')[0].indexOf('quantity_false') > -1 ) {
        $('#wrap_quickview #layout_item').addClass('zero_quantity');
    }


    if ((htmlData.split('<body class="')[1] && htmlData.split('<body class="')[1].split('"')[0].indexOf('showallqv') > -1) || htmlData.split('<body\r\n  class="')[1] ? .split('"')[0].indexOf('showallqv') > -1) {
        $('#wrap_quickview').addClass('showAllAdmin');
    }

    if ((htmlData.split('<body class="')[1] && htmlData.split('<body class="')[1].split('"')[0].indexOf('hideallqv') > -1) || htmlData.split('<body\r\n  class="')[1] ? .split('"')[0].indexOf('hideallqv') > -1) {
        $('#wrap_quickview').addClass('hideAllAdmin');
    }

    if ($(htmlData).find("div#item_son_items").length > 0) {
        $('#wrap_quickview').addClass('itemDad');
    }





    if (show_upgrades == "true") {
        if (typeof (uploadFileFromUpgrade) === 'function') {
            uploadFileFromUpgrade();
        }
    }

    // add to cart button
    if (show_addCart == "true") {
        quickviewAddToCartBtn();
    }

    // buy now button
    if (show_buy_now == "true") {
        quickviewBuyNowBtn();
    }


    // lightslider: responsive shops + classic mobile
    if (storeLayout ? .indexOf("responsive") > 0 || storeLayout == undefined || $(window).width() < 767) {
        $('#wrap_quickview #lightSlider').lightSlider({
            gallery: true,
            item: 1,
            loop: false,
            slideMargin: 0,
            thumbItem: 6,
            useCSS: true,
            adaptiveHeight: true,
        });
    }
}

// inventory code from item page
const quickviewInventoryChanges = () => {
    if ($('#wrap_quickview select.inventory').length) {
        // prepearing the contact/buy toggle
        $('#wrap_quickview #item_upgrades label.inventory').each(function (index, el) {
            $(this).addClass('must_upgrade');
        });
        $('#wrap_quickview #item_details #item_link_buy_now .buyNow').after('<div class="contactNow"><a>' + $('#wrap_quickview label.inventory').attr('data-contact') + '</a></div>');
        $('#wrap_quickview .contactNow').hide();
        $('#wrap_quickview .contactNow a').click(function () {
            window.location.href = $('#wrap_quickview .link_ask_about_item').attr('href');
        });


        $('#wrap_quickview select.inventory:not(".unshown"), #wrap_quickview select.fake_select').change(function () {
            $('#wrap_quickview select.inventory:not(".unshown"), #wrap_quickview select.fake_select').each(function (index, el) {
                if ($(this).children(':selected').text().indexOf("חסר במלאי") > -1) {

                    if ($('body').hasClass('special_cart')) {
                        // $('#wrap_quickview a.commit_to_real').hide();
                        $('#wrap_quickview .product_quantity').hide();
                        $('#wrap_quickview .fake_quantity').hide();
                        $('#wrap_quickview .contactNow').show().siblings('.buyNow').hide();

                        if (!$('#wrap_quickview #layout_item div#item_details .contactNow a').length) {
                            $('#wrap_quickview .item_option5 .price_wrap').after('<div class="contactNow"><a href="' + $('#wrap_quickview .layout_item a.bold_link.link_ask_about_item').attr('href') + '">צור קשר</a></div>');
                        } else {
                            $('#wrap_quickview #layout_item div#item_details .contactNow').show();
                            $('#wrap_quickview #layout_item div#item_details .contactNow a').show();
                        }
                    } else {
                        $('#wrap_quickview .contactNow').show().siblings('.buyNow').hide();
                        $('#wrap_quickview .contactNow').show().parent().siblings('#add_to_cart').hide();
                        $('#wrap_quickview div#layout_item div#item_deal_items').hide();
                        $('#wrap_quickview .extra_btn').hide();
                    }
                    return false;
                } else {
                    if ($('body').hasClass('special_cart')) {
                        $('#wrap_quickview a.commit_to_real').show();
                        $('#wrap_quickview .product_quantity').show();
                        $('#wrap_quickview .fake_quantity').show();
                        $('#wrap_quickview .contactNow').show().siblings('.buyNow').show();
                        // $('#wrap_quickview #layout_item div#item_details .contactNow a').hide();
                        $('#wrap_quickview #layout_item div#item_details .contactNow').hide();
                    } else {
                        $('#wrap_quickview .buyNow').show().siblings('.contactNow').hide();
                        $('#wrap_quickview #add_to_cart').show().siblings('#item_link_buy_now ').children('.contactNow').hide();
                        $('#wrap_quickview .extra_btn').show();
                    }
                }
            });
        });

        // local
        $('#wrap_quickview select.inventory:not(".unshown")').change(function () {
            localSelectChanged_qv();
        });

        // checking if this select.inventory is multiple select or normal
        $('#wrap_quickview select.inventory').each(function (index, el) {
            select_options($(this));
            if (isMultiple) {
                main_code($(this), index);
            } else {
                // adds out-of-stock text to the out-of-stock options
                if (!$(this).hasClass('fake_select')) {
                    $(this).children('option').each(function (index) {
                        if ($(this).siblings('option').length == 0) {
                            // $(this).parent().prepend('<option selected="selected">בחר</option>');
                            if ($(this).attr('data-stock') == undefined) {
                                $(this).text('');
                                return;
                            } else if (!check_for_stock($(this).attr('data-stock'))) {
                                $(this).text($(this).text() + " - " + $('#wrap_quickview label.inventory').attr('data-stock-text'));
                            }
                        };
                        if (index > 0) {
                            if ($(this).attr('data-stock') == undefined) {
                                $(this).text('');
                                return;
                            } else if (!check_for_stock($(this).attr('data-stock'))) {
                                $(this).text($(this).text() + " - " + $('#wrap_quickview label.inventory').attr('data-stock-text'));
                            }
                        }
                    });
                };
            }
        });


        // contactNow at start
        $('#wrap_quickview select.inventory:not(".unshown"), #wrap_quickview select.fake_select').each(function (index, el) {
            if ($(this).children(':selected').text().indexOf("חסר במלאי") > -1) {
                $('#wrap_quickview a.commit_to_real').hide();
                $('#wrap_quickview .contactNow').show().siblings('.buyNow').hide();
                $('#wrap_quickview .fake_quantity').hide();
                $('#wrap_quickview .product_quantity').hide();
            }
        })
    }

}



// strengths changes
const quickviewStrengthsChanges = () => {
    // strengths
    // if (show_strengths == "true") {
    if ($("#wrap_quickview .item_main_bottom_left .extra_icons").length == 0) {
        $("#wrap_quickview .item_main_bottom_left .icons ").after('<div class="extra_icons col-xs-12"><a class="icon pos_0 col-xs-4" target="_blank"><img src="' + extra_icons_icon1 + '" alt=""></a><a class="icon pos_1 col-xs-4" target="_blank"><img src="' + extra_icons_icon2 + '" alt=""></a><a class="icon pos_2 col-xs-4" target="_blank"><img src="' + extra_icons_icon3 + '" alt=""></a></div>')
    }
    // }

    // change strengths from hybrid fields
    if (strengths_delete_content == "true") {
        $('#wrap_quickview div#item_current_content ul.list').children().remove();
    }

    if (strengths_text1.length > 0) {
        $('#wrap_quickview div#item_current_content ul.list').append('<li><strong>' + strengths_text1 + '<i>&nbsp;</i></strong></li>');
    }

    if (strengths_text2.length > 0) {
        $('#wrap_quickview div#item_current_content ul.list').append('<li><strong>' + strengths_text2 + '<i>&nbsp;</i></strong></li>');
    }

    if (strengths_text3.length > 0) {
        $('#wrap_quickview div#item_current_content ul.list').append('<li><strong>' + strengths_text3 + '<i>&nbsp;</i></strong></li>');
    }

    if (strengths_text4.length > 0) {
        $('#wrap_quickview div#item_current_content ul.list').append('<li><strong>' + strengths_text4 + '<i>&nbsp;</i></strong></li>');
    }

    if (strengths_text5.length > 0) {
        $('#wrap_quickview div#item_current_content ul.list').append('<li><strong>' + strengths_text5 + '<i>&nbsp;</i></strong></li>');
    }
}

// view changes after load
const quickviewChangesAfterLoad = () => {
    try {
        // trigger for match other hybrids
        $("#wrap_quickview").trigger("loadedqv");

        setTimeout(function () {
            // read more
            let sub_title = $('#wrap_quickview #item_current_sub_title > span').height();
            if (sub_title > 43 && $('#wrap_quickview .sub_title_read_more_wrap').length == 0) {
                $('#wrap_quickview #item_current_sub_title').after('<div class="sub_title_read_more_wrap"><a class="sub_title_read_more">קרא עוד...</a></div>');
                $('#wrap_quickview #item_current_sub_title').css('max-height', '43px');
                $('#wrap_quickview #item_current_sub_title').removeClass('open');
                $('#wrap_quickview .sub_title_read_more').text('קרא עוד...');

                $("#wrap_quickview .sub_title_read_more").click(function () {
                    if (sub_title > 43 && $('#wrap_quickview #item_current_sub_title').height() == 43) {
                        $('#wrap_quickview #item_current_sub_title').addClass('open');
                        $('#wrap_quickview #item_current_sub_title').css('max-height', 'inherit');
                        $('.sub_title_read_more').text('סגור');
                    } else {
                        $('#wrap_quickview #item_current_sub_title').css('max-height', '43px');
                        $('#wrap_quickview #item_current_sub_title').removeClass('open');
                        $('#wrap_quickview .sub_title_read_more').text('קרא עוד...');
                    }
                });
            }
            $(window).trigger('resize');
        }, 500);


        // gallery - fix img src if lazyloading lightSlider

        $("#wrap_quickview #item_show_carousel ul#lightSlider li").each(function () {
            if ($(this).find("img").attr("data-original")) {
                var link = $(this).find("img").attr("data-original");
                $(this).find("img").attr("src", link);
            }
        })

        // strength - fix img src if lazyloading strengths
        if (show_strengths == "true") {
            $("#wrap_quickview .extra_icons a").each(function () {
                if ($(this).find("img").attr("data-original")) {
                    var link = $(this).find("img").attr("data-original");
                    $(this).find("img").attr("src", link);
                }
            })
        }

        // upgrades pics if lazy loading
        $("#wrap_quickview #item_upgrades .item_upgrades_with_images label").each(function () {
            if ($(this).find("img").attr("data-original")) {
                var link = $(this).find("img").attr("data-original");
                $(this).find("img").attr("src", link);
            }
        })


        // copy item link to note_upgrades instead of buttons. (not displayed as default)
        $("#wrap_quickview .special_cart_wrapper").append("<div class='note_upgrades'></div>");
        $("#wrap_quickview .note_upgrades").click(function () {
            $("#wrap_quickview .link_wrapper a")[0].click();
        })


        // note for Dad item - without buy buttons 
        if ($("#wrap_quickview").hasClass("itemDad")) {
            $("#wrap_quickview .note_upgrades").text(btn_text_dad);
        }

        // note for item without buy buttons
        if ($("#wrap_quickview").hasClass("hideAllAdmin")) {
            $("#wrap_quickview .note_upgrades").text(btn_text_hide);
        }


        // classic shops
        if (storeLayout ? .indexOf("responsive") == -1 || storeLayout == undefined) {
            // activate addToCart on start 
            $("#wrap_quickview .fake_quantity input.fake_counter").val("1").trigger('change')
            $("#wrap_quickview .product_quantity .amount_feed input").val("1");

            // classic gallery
            if ($("#wrap_quickview #item_show_carousel").length) {
                classicGallery();
            }
        }


    } catch (error) {
        console.log("TCL: quickviewChangesAfterLoad -> error", error);
    }
}

// sort upgrades, which show or hide 
const sortUpgradesToShow = () => {
    // hide upgrade inventory - only 1 
    $("#wrap_quickview .upgrades_form_fields > div").each(function () {
        var title = $(this).find(".upgrade_topic_title").text();
        if (title == "כמות" || title == "כמות במלאי") {
            $(this).hide();
        }
    });

    // sort upgrades to show
    $("#wrap_quickview #item_upgrades_top .upgrades_form_fields label").each(function () {
        let label = $(this);
        label.parent().addClass("upg_wrapper");

        if (label.hasClass("inventory")) {
            label.parent().addClass("inventory");
        }
        if (label.hasClass("must_upgrade")) {
            label.parent().addClass("must_upgrade");
        }
    })


    //  ---------- add class hide_upgrades if not inventory or must_upgrade ---------- 
    // upgrades_form_fields 
    $("#wrap_quickview #item_upgrades_top .upg_wrapper").each(function () {
        let itemUpgrade = $(this);
        if (!itemUpgrade.hasClass("must_upgrade") && !itemUpgrade.hasClass("inventory")) {
            if (!$("#wrap_quickview").hasClass("hide_upgrades")) {
                $("#wrap_quickview").addClass("hide_upgrades");
            }
            itemUpgrade.addClass("hide_upgrade");
        }
    })

    // multipleSelects
    $("#wrap_quickview #item_upgrades_top .multipleSelects label").each(function () {
        let itemUpgrade = $(this);
        if (!itemUpgrade.hasClass("must_upgrade")) {
            if (!$("#wrap_quickview").hasClass("hide_upgrades")) {
                $("#wrap_quickview").addClass("hide_upgrades");
            }
            itemUpgrade.addClass("hide_upgrade");
        }
    })


    $("#wrap_quickview #item_upgrades_top .item_upgrades_with_images div").each(function () {
        let itemUpgrade = $(this);
        // must_upgrade
        if (!itemUpgrade.hasClass("must_upgrade")) {
            if (!$("#wrap_quickview").hasClass("hide_upgrades")) {
                $("#wrap_quickview").addClass("hide_upgrades");
            }
            itemUpgrade.parent().addClass("hide_upgrade");
        } else itemUpgrade.parent().addClass("must_upgrade");

        // showoneqv 
        if (itemUpgrade.hasClass("showoneqv")) {
            itemUpgrade.parent().addClass("showoneqv");
        }
    })
}

// ----------------------------------------- end QV view changes-----------------------------------------------

// ------------------------------------------- add buy buttons ------------------------------------------------

// add buy now button
const quickviewBuyNowBtn = () => {
    if ($("#wrap_quickview .main_price_and_btn .special_cart_wrapper").length == 0) {
        $('#wrap_quickview div#item_link_buy_now').wrapAll('<div class="special_cart_wrapper"></div>');
    } else $("#wrap_quickview .main_price_and_btn .special_cart_wrapper").append($('#wrap_quickview div#item_link_buy_now'));


    // if floating cart -> buy now is click at add to cart 
    if ($(".special_cart_with_upgrades").length > 0 || $("div.cart").length > 0) {
        $('#wrap_quickview div#item_link_buy_now a#big_buy_now_link').click(function (event) {
            event.stopPropagation();
            $('.quickview_main .fake_quantity .commit_to_real').click();
            if (!$('.quickview_main .fake_quantity .commit_to_real').hasClass('btn_err_must_upgrade')) {
                submit_checkout();
                $('.special_cart div.checkout a').click();
            };
        });
    } else {

        // if no floating cart -> buy now is submitting form -> server side ---- // 
        $("#wrap_quickview .product_quantity").remove();
        $("#big_buy_now_link, #small_buy_now_link, #middle_buy_now_link, #deal_button, #son_button").click(function (event) {
            let langu = $('html').attr('lang');
            let go = true;
            // check if all selected upgrades aren't blank
            $("#wrap_quickview .must_upgrade select option:selected").each(function () {
                if ($(this).text() == "בחר " || !$(this).val()) {
                    if (langu == 'he') {
                        alert("נא למלא - " + $(this).parent().siblings('span').text());
                    } else {
                        let msg = $(this).parent().siblings('span').text().replace('שדרוג חובה', "Must Upgrade");
                        alert("Please fill - " + msg);
                    }
                    go = false;
                    return go;
                }
            });
            if (go == false) {
                return go;
            }
            // check if all checkbox upgrades aren't blank              
            $("#wrap_quickview .upgrades_form_fields label.must_upgrade").each(function () {
                if ($(this).parent().find("input:checkbox").length != 0 && $(this).parent().find("input").filter(':checked').length == 0) {
                    if (langu == 'he') {
                        alert("נא למלא - " + $(this).parent().find(".upgrade_topic_title").text());
                    } else {
                        let msg = $(this).parent().find(".upgrade_topic_title").text().replace('שדרוג חובה', "Must Upgrade");
                        alert("Please fill - " + msg);
                    }
                    go = false;
                    return go;
                }
            });
            if (go == false) {
                return go;
            }
            // check if all text upgrades aren't blank
            $("#wrap_quickview .upgrades_form_fields label.must_upgrade").each(function () {
                if ($(this).find("input[type=text]").length != 0 && $(this).find("input[type=text]").val().length == 0) {
                    if (langu == 'he') {
                        alert("נא למלא - " + $(this).parent().find(".upgrade_topic_title").text());
                    } else {
                        let msg = $(this).parent().find(".upgrade_topic_title").text().replace('שדרוג חובה', "Must Upgrade");
                        alert("Please fill - " + msg);
                    }
                    go = false;
                    return go;
                }
            });
            if (go == false) {
                return go;
            }
            // check if all textarea upgrades aren't blank
            $("#wrap_quickview .upgrades_form_fields label.must_upgrade").each(function () {
                if ($(this).find("textarea").length != 0 && $(this).find("textarea").val().length == 0) {
                    if (langu == 'he') {
                        alert("נא למלא - " + $(this).parent().find(".upgrade_topic_title").text());
                    } else {
                        let msg = $(this).parent().find(".upgrade_topic_title").text().replace('שדרוג חובה', "Must Upgrade");
                        alert("Please fill - " + msg);
                    }
                    go = false;
                    return go;
                }
            });
            if (go == false) {
                return go;
            }
            // check if all files aren't blank
            if ($('#wrap_quickview label.must_upgrade input[type=file]').length) {
                let pasport_input = $('.must_upgrade input[type=file]');
                if (pasport_input.val() != '') {
                    let valid_extensions = /(\.jpg|\.jpeg|\.gif|\.png)$/i;
                    if (valid_extensions.test(pasport_input.val()) == false) {
                        if (langu == 'he') {
                            alert('ניתן לצרף קובץ מסוג תמונה בלבד, בפורמטים הבאים: jpg, jpeg, gif, png');
                        } else {
                            alert('Please attach only image file, in the following formats: jpg, jpeg, gif, png');
                        }
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    msg = pasport_input.parent().parent().find(".upgrade_topic_title").text();
                    if (msg.length == 0) {
                        if (langu == 'he') {
                            msg = "נא לצרף קובץ";
                        } else {
                            msg = "Please attach file";
                        }
                    }
                    alert(msg);
                    return false;
                }
            }
            return go;
        });

        $('#wrap_quickview div.smallButton, div.buyNow').click(makeButtonFromLinkFunc);

        function makeButtonFromLinkFunc() {
            const $this = $(this);
            $this.addClass('active'); // use a real class instead of the psuedo-class
            setTimeout(function () {
                $this.removeClass('active').closest('form').submit();
            }, 200);
        }

    }

}


// add add to cart button
const quickviewAddToCartBtn = () => {
    try {
        const hasSonItems = $('#wrap_quickview #layout_item #item_son_items').length ? true : false;
        const isOnlyContact = $('#wrap_quickview #layout_item .buyNow').length ? false : true;
        if (!hasSonItems && !isOnlyContact) {
            if ($('#wrap_quickview #layout_item  .product_quantity').length == 0 && $('#wrap_quickview #layout_item .fake_quantity').length == 0)
                $('#wrap_quickview #layout_item #item_details').append('<div class="product_quantity"><div class="reduce_item quantity"><a>-</a></div><div class="amount_feed"><input class="counter" value=0 type="number"></div><div class="add_item quantity"><a>+</a></div></div><div class="fake_quantity"><input type="text" class="fake_counter" value="0"><a class="commit_to_real"></a></div>');
            if (add_to_cart_btn_text.length > 0) {
                $('#wrap_quickview #layout_item #item_details .commit_to_real').text(add_to_cart_btn_text);
            } else {
                $('#wrap_quickview #layout_item #item_details .commit_to_real').text("הוספה לעגלה");
            }

            if ($("#wrap_quickview .main_price_and_btn .special_cart_wrapper").length == 0) {
                $("#wrap_quickview .main_price_and_btn").append('<div class="special_cart_wrapper"></div>');
            }
            $('#wrap_quickview .special_cart_wrapper').prepend($('#wrap_quickview #item_details .fake_quantity')).prepend($('#wrap_quickview #item_details .product_quantity'));
            $('#wrap_quickview #layout_item').addClass('has_button');

            resetCounter();
            addAndReduceHandler();
            addToCartHandler();
            updateItemPrice();
        }
    } catch (error) {
        console.log("TCL: quickviewAddToCartBtn -> error", error);
    }
}

const resetCounter = () => {
    try {
        let minQuantity = '1';
        if ($('#wrap_quickview #item_details span.quantity_step_value').length && $('#wrap_quickview #item_details span.quantity_step_value').text() != '') {
            minQuantity = $('#wrap_quickview #item_details span.quantity_step_value').text();
        }
        $('#wrap_quickview .quickview .special_cart_wrapper .product_quantity .amount_feed input.counter').val(minQuantity);
        $('#wrap_quickview .quickview .special_cart_wrapper .fake_quantity input.fake_counter').val(minQuantity);
    } catch (error) {
        console.log("TCL: resetCounter -> error", error);
    }
}

// click on + or -
const addAndReduceHandler = () => {
    try {
        let currentLayoutItem = 0;
        $('#wrap_quickview #item_details .product_quantity .quantity').each(function () {
            const quantityBtn = $(this); // +-
            quantityBtn.click(function () {
                currentLayoutItem = quantityBtn.parent().siblings('.fake_quantity').children('.fake_counter').val();
                const hasQuantityStep = $('#wrap_quickview #item_details .quantity_step_value').length;
                let currentStep = parseFloat($('#wrap_quickview #item_details .quantity_step_value').text());
                if (quantityBtn.hasClass("add_item")) {
                    if (hasQuantityStep == 1) {
                        currentLayoutItem = parseFloat(currentLayoutItem) + currentStep;
                    } else {
                        currentLayoutItem++;
                    }
                } else {
                    if (hasQuantityStep == 1) {
                        currentLayoutItem = parseFloat(currentLayoutItem) - currentStep;
                    } else {
                        currentLayoutItem--;
                    }
                    if (currentLayoutItem < 0) {
                        currentLayoutItem = 0;
                    }
                    if (currentStep < 0) {
                        currentStep = 0;
                    }
                }
                if (hasQuantityStep == 1) {
                    quantityBtn.parent().siblings('.fake_quantity').children('.fake_counter').val(currentLayoutItem.toFixed(2)).trigger('change');
                } else {
                    quantityBtn.parent().siblings('.fake_quantity').children('.fake_counter').val(parseInt(currentLayoutItem)).trigger('change');
                }
            });

        });

        $('#wrap_quickview #item_details .fake_quantity input.fake_counter').each(function (index, el) {
            $(this).change(function () {
                $(this).parent().siblings('.product_quantity').find('.amount_feed input').val($(this).val());
            });
        });
    } catch (error) {
        console.log("TCL: addAndReduceHandler -> error", error);
    }
}

const addToCartHandler = () => {
    try {

        if ($(".special_cart_with_upgrades").length > 0 || $("div.cart").length > 0) {

            $('#wrap_quickview #item_details a.commit_to_real').click(function () {
                const addToCartBtn = $(this);
                let quantityStep = "1";
                let $quantityStep = addToCartBtn.parents('#item_details').first().find('span.quantity_step_value');
                if ($quantityStep && $quantityStep.text() != '') {
                    quantityStep = $quantityStep.text();
                }
                if (!addToCartBtn.hasClass('zero_value')) {
                    addToCartBtn.siblings('.fake_counter').val(addToCartBtn.parent().parent().find('.product_quantity input.counter').val());
                    let quantityValue = Number(addToCartBtn.siblings('.fake_counter').val());
                    if (isNaN(quantityValue))
                        addToCartBtn.siblings('.fake_counter').addClass('err');
                    else {
                        addToCartBtn.siblings('.fake_counter').removeClass('err');
                        addToCartBtn.parent().siblings('.product_quantity').find('.amount_feed input.counter').val(addToCartBtn.siblings('.fake_counter').val()).trigger('change');
                    }
                    if (!addToCartBtn.hasClass('btn_err_must_upgrade')) {
                        addToCartBtn.siblings('.fake_counter').val(quantityStep).trigger('change');
                    }
                    addToCartBtn.addClass('clicked');
                }
            });

            // if inventory -> must upgrade
            $('#wrap_quickview #item_upgrades label.inventory').each(function () {
                $(this).addClass('must_upgrade');
            });

            // prepare for find_id function 
            const idItem = "item_id_" + $('#wrap_quickview #item_id').val();
            const priceItem = $('#wrap_quickview #item_show_price .price_value').text().replace('מחיר', '');
            const titleItem = $('#wrap_quickview #item_current_title h1 span').text();
            let imgItem = $('#wrap_quickview div#item_show_carousel ul#lightSlider > li:first-child > img').attr('data-original') || $('#wrap_quickview div#item_show_carousel ul#lightSlider > li:first-child > img').attr('src');
            if (imgItem == undefined) { // classic layout
                imgItem = $('#wrap_quickview div#item_show_carousel .mainImage a img').attr('src');
            }
            let arrOfUpgrades = $('#wrap_quickview .multipleSelects select:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields select:not(.not_for_upgrades_cart, .fake_select), #wrap_quickview .upgrades_form_fields input:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields textarea:not(.not_for_upgrades_cart), #wrap_quickview .item_upgrades_with_images .checkbox-group input, #wrap_quickview #item_upgrades label.for_upgrades_cart input[type=file]');
            // var arrOfUpgrades = $('#wrap_quickview .multipleSelects select:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields select:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields input:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields textarea:not(.not_for_upgrades_cart), #wrap_quickview .item_upgrades_with_images .checkbox-group input, #wrap_quickview #item_upgrades label.for_upgrades_cart input[type=file]');

            arrOfUpgrades.each(function () {
                $(this).change(function () {
                    $('#wrap_quickview .commit_to_real').removeClass('clicked');
                });
            });

            let quantityStep = Number($('#wrap_quickview div#item_main span.quantity_step_value').text());
            if (quantityStep == 0) {
                quantityStep = 1;
            }


            $('#wrap_quickview .amount_feed input.counter').change(function () {
                $(this).parents('.product_quantity').first().siblings('.fake_quantity').find('.fake_counter').val($(this).val()).change();
                const quantity = Number($(this).val());
                const upgrades = convert_upgrades_to_string(arrOfUpgrades);
                let mustUpgradeOk = check_must_upgrade_qv($('#wrap_quickview .multipleSelects .must_upgrade select:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields .must_upgrade select:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields .must_upgrade input:not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields .must_upgrade textarea:not(.not_for_upgrades_cart), #wrap_quickview .item_upgrades_with_images .checkbox-group.must_upgrade input, #wrap_quickview .must_upgrade.for_upgrades_cart input[type=file], #wrap_quickview .must_upgrade_error.for_upgrades_cart input[type=file]'));
                let notChosenMustUpgrade = 0;

                for (let i = 0; i < mustUpgradeOk.length; i++) {
                    if (!(mustUpgradeOk[i] == true)) {
                        notChosenMustUpgrade = 1;
                    }
                }

                for (let i = 0; i < mustUpgradeOk.length; i++) {
                    if (!(mustUpgradeOk[i] == true)) {
                        let errorUpgradeDiv = return_upgrade_div(mustUpgradeOk[i], 'label');
                        errorUpgradeDiv.addClass('must_upgrade_error');
                        if (!$('#wrap_quickview a.commit_to_real').hasClass('btn_err_must_upgrade'))
                            $('#wrap_quickview a.commit_to_real').addClass('btn_err_must_upgrade');
                        if (errorUpgradeDiv.find('span.must_upgrade_comment').length == 0) {
                            $(errorUpgradeDiv).append($('<span class="must_upgrade_comment">שדרוג חובה</span>'));
                        }
                        mustUpgradeOk[i].change(function () {
                            if ($(this).children('option:selected').val() != "" && $(this).children('option:selected').val() != null && $(this).children('option:selected').val() != undefined) {
                                $(this).parent().removeClass('must_upgrade_error');
                                $(this).siblings('.must_upgrade_comment').remove();
                                if ($('#wrap_quickview a.commit_to_real').hasClass('btn_err_must_upgrade'))
                                    $('#wrap_quickview a.commit_to_real').removeClass('btn_err_must_upgrade');
                            } else if ($(this).children('option:selected').val() == "" || $(this).children('option:selected').val() == null || $(this).children('option:selected').val() == undefined) {
                                $(this).parent().addClass('must_upgrade_error');
                                if (($(this).parent().children('span.must_upgrade_comment').length == 0) && !($(this).hasClass('unshown'))) {
                                    $(this).parent().append($('<span class="must_upgrade_comment">שדרוג חובה</span>'));
                                }
                            }
                        });
                    } else {
                        if (notChosenMustUpgrade == 0) {
                            $('#wrap_quickview #item_main .must_upgrade_comment').each(function () {
                                $(this).remove();
                            });
                            if (upgrades == "") {
                                find_id(idItem, titleItem, priceItem, imgItem, quantity, quantityStep);
                                quickviewFadeout();

                                // cart page - addOn carousel
                                if (window.location.pathname.includes("orders") && window.location.pathname.includes("new")) {
                                    $(".checkout a").click();
                                }

                            } else {
                                const upgrades_price = get_upgrades_price(arrOfUpgrades, priceItem);
                                find_id(idItem + "=>" + upgrades, titleItem, upgrades_price, imgItem, quantity, quantityStep, get_upgrades_text(arrOfUpgrades));
                                quickviewFadeout();

                                // cart page - addOn carousel
                                if (window.location.pathname.includes("orders") && window.location.pathname.includes("new")) {
                                    $(".checkout a").click();
                                }
                            }
                        }
                    }
                }
            });

            // from fake_counter_change function
            $('#wrap_quickview .fake_counter').each(function (index, el) {
                $(this).change(function () {
                    $(this).siblings('.commit_to_real').removeClass('clicked');
                    if ($(this).val() != '0.' && (isNaN(Number($(this).val())) || Number($(this).val()) <= 0)) {
                        $(this).siblings('.commit_to_real').addClass('zero_value');
                        if (!$('#wrap_quickview #item_son_items').length) {
                            if ($('#wrap_quickview span.zero_val_comment').length == 0) {
                                $('#wrap_quickview #item_details #item_link_buy_now').after($('<span class="zero_val_comment">נא לבחור כמות</span>'));
                            }
                        }
                        $(this).val('0');
                    } else {
                        $(this).siblings('.commit_to_real').removeClass('zero_value');
                        $('#wrap_quickview span.zero_val_comment').remove();
                    }
                });
                $(this).keyup(function () {
                    $(this).trigger('change');
                });
                $(this).trigger('change');
            });

        } else {

            // if not floating cart -> click on buy now
            $("#wrap_quickview .fake_quantity").click(function () {
                $("#wrap_quickview #item_link_buy_now .buyNow #big_buy_now_link").click();
            })
        }



    } catch (error) {
        console.log("TCL: addToCartHandler -> error", error);
    }
}

const updateItemPrice = () => {
    try {
        let item_price;
        if ($('#wrap_quickview #item_details #item_show_price .price_value').length > 0) {
            item_price = Number($('#wrap_quickview #item_show_price .price_value').text().replace(',', '').replace('₪', '').trim());
        } else {
            $('#wrap_quickview #item_details').prepend('<div class="wrap_price"><div id="item_show_price"><span class="price_title">מחיר ליח׳</span><span itemprop="offerDetails" itemscope="" itemtype="http://data-vocabulary.org/Offer"><meta itemprop="currency" content="ILS"><span class="price_value to_the_right" itemprop="price"></span></span></div></div>');
            item_price = 0;
        }
        let item_price_with_upgrade = item_price;
        let upgrade_price = 0;
        let arr_of_upgrades = $('#wrap_quickview #item_upgrades select:not(.unshown):not(.not_for_upgrades_cart), #wrap_quickview .upgrades_form_fields input:not(.not_for_upgrades_cart), #wrap_quickview .item_upgrades_with_images .checkbox-group label input');

        arr_of_upgrades.each(function () {
            $(this).change(function () {
                item_price_with_upgrade = item_price;
                arr_of_upgrades.each(function () {
                    if ($(this).attr('type') == "radio" || $(this).attr('type') == "checkbox") {
                        if ($(this).is(':checked')) {
                            if ($(this).parent().hasClass('item_upgrades_with_images_radio_button')) {
                                if ($(this).parent().siblings('.item_upgrades_with_images_price').length > 0) {
                                    upgrade_price = Number($(this).parent().siblings('.item_upgrades_with_images_price').text().replace(',', '').replace('₪', '').trim());
                                } else {
                                    upgrade_price = 0;
                                }
                            } else {
                                upgrade_price = Number($(this).data('price'));
                            }
                            item_price_with_upgrade = item_price_with_upgrade + upgrade_price;
                        }
                    } else {
                        if ($(this).hasClass('fake_select') && $(this).hasClass('level_0')) {
                            item_price_with_upgrade = item_price_with_upgrade + 0;
                        } else if ($(this).hasClass('fake_select') && $(this).hasClass('level_1')) {
                            if ($(this).parent().parent().siblings('select.inventory').children('option:selected').data('price') != undefined && $(this).parent().parent().siblings('select.inventory').children('option:selected').data('price') != "") {
                                upgrade_price = Number($(this).parent().parent().siblings('select.inventory').children('option:selected').data('price'));
                                item_price_with_upgrade = item_price_with_upgrade + upgrade_price;
                            }
                        } else {
                            if ($(this).children('option:selected').data('price') != undefined && $(this).children('option:selected').data('price') != "") {
                                upgrade_price = Number($(this).children('option:selected').data('price'));
                                item_price_with_upgrade = Number((item_price_with_upgrade + upgrade_price).toFixed(1));
                            } else {
                                item_price_with_upgrade = item_price_with_upgrade + 0;
                            }
                        }
                    }
                });
                $('#wrap_quickview #item_show_price .price_value').text(item_price_with_upgrade + ' ₪');
                $('#wrap_quickview .price_value').digits();
            });
        });

        $.fn.digits = function () {
            return this.each(function () {
                $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
            });
        }
    } catch (error) {
        console.log("TCL: updateItemPrice -> error", error);
    }
}


// --------------------------------------------- end add buy buttons-------------------------------------------

// ------------------------------------------- add QV btn in deal_items + also_buy ----------------------------

// deal_items + also_buy
const quickviewDealItems = () => {
    try {
        $('div#item_deal_items table.deal_items td:not(.plus,.equal,.deal_button,:first-child)').each(function () {
            const dealItem = $(this);
            dealItem.append(listItemQvBtn);

            dealItem.find('.quickview_btn_wrapper').click(function () {
                // const qvDealItemClass = $("div.deal_items em."+qvDealItemId+"").attr("data-css-class");
                const itemId = $(this).parent().attr('class').split(' ')[0].split('_')[1];

                quickviewBtnClickHandler(itemId, "");
            });
        });
    } catch (error) {
        console.log("TCL: function quickviewDealItems -> error", error);
    }
}

const quickviewAlsoBuyItems = () => {
    try {
        $('#bg_middle #item_also_buy em').each(function () {
            const alsoBuyItem = $(this);
            alsoBuyItem.append(listItemQvBtn);
        });

        $('#bg_middle #item_also_buy').on('click', '.quickview_btn_wrapper', function () {
            // const qvAlsoBuyItemClass = $(this).parent().find("a b").attr("data-css-class");
            const itemId = (($(this).parent().find('input[name="item_ids[]"]').val()).match(/\d+/))[0];

            quickviewBtnClickHandler(itemId, "");

        });
    } catch (error) {
        console.log("TCL: function quickviewAlsoBuyItems -> error", error);
    }
}

// ----------------------------------------- end deal_items + also_buy ----------------------------------------


// ------------------------------------------------- FLOW ----------------------------------------------------

if (show_list_items == "true") {
    quickviewLayoutListItems();
    if (($("body").hasClass("layout_category") || $("body").hasClass("layout_items")) || $("body").hasClass("layout_X")) {
        quickviewFuncInfscr();
    }
}

$(window).load(function () {
    quickviewDynamicCarousel();
});

if ($("body").hasClass("layout_item") && $("body").hasClass("layout_responsive")) {
    if (show_deal_items == "true") {
        quickviewDealItems();
    }
    if (show_also_buy == "true") {
        quickviewAlsoBuyItems();
    }
}

$(document).ready(function () {
    $('#wrap_quickview .close_quickview').click(function (e) {
        quickviewFadeout();
    });

    $('#wrap_quickview #quickview_backdrop').click(function (e) {
        if (e.target === this) {
            quickviewFadeout();
        }
    });
});


// -------------------------------- functions upgrades stock from item page -----------------------------------

function select_options(select_element) {
    $(select_element).children('option').each(function (index) {
        if (index > 0 && $(this).attr('data-values') != undefined) {
            if ($(this).attr('data-values').indexOf(';') > 0)
                isMultiple = true;
        }
    });
}

function main_code(select_element, index) {
    $(select_element).children('option').each(function () {
        item_upgrades_js[$(this).val()] = Number($(this).attr('data-price'));
    });
    $(select_element).hide().addClass('unshown');
    let temp_arr, all_arr = [];
    $(select_element).children('option').each(function () {
        if ($(this).attr('data-values') != undefined) {
            temp_arr = [$(this).val()];
            $.each(str_to_arr($(this).attr('data-values')), function (k, v) {
                temp_arr.push(v);
            });
            temp_arr.push($(this).attr('data-stock'));
            temp_arr.push($(this).attr('data-price'));
            all_arr.push(temp_arr);
            temp_arr = [];
        }
    });


    // ========== end data =============

    arr_heading = str_to_arr($($('#wrap_quickview label.inventory')[index]).attr('data-titles'));
    num_of_levels = arr_heading.length;
    // inserts the data from the array (all_arr) to the upg object
    for (var x = 0; x < all_arr.length; x++) {
        var temp_upg = itemUpgrades;
        for (var i = 1; i < all_arr[x].length - 2; i++) {
            if (!temp_upg[all_arr[x][i]]) {
                if (i == all_arr[x].length - 3) // if its the last one sets the id value
                    temp_upg[all_arr[x][i]] = all_arr[x][0] + "-" + all_arr[x][i + 1] + "-" + all_arr[x][i + 2];
                else
                    temp_upg[all_arr[x][i]] = {};
            }
            temp_upg = temp_upg[all_arr[x][i]];
        }
    }

    $($('#wrap_quickview label.inventory')[index]).append('<div class="fake_selects pos_' + index + '"></div>');
    for (var i = 0; i < num_of_levels; i++) {
        $('#wrap_quickview .fake_selects.pos_' + index + '').append('<div class="level_' + i + '"><label class="level_' + i + '">' + arr_heading[i] + '</label><select class="fake_select pos_' + index + ' level_' + i + '" disabled></select></div>');
    }
    $('#wrap_quickview select.fake_select.pos_' + index + '.level_0').append(createOptions(itemUpgrades)).removeAttr('disabled'); // init the first select
    $('#wrap_quickview select.fake_select').change(function () {
        level = Number($(this).attr('class').charAt($(this).attr('class').length - 1)); // finding the level that has been changed
        reset_selects($(select_element), level + 1); // reset the select that comes after it
        $(select_element).trigger('change');
        if (typeof get_last_select_value() == "string") {
            if (/Android|webOS|iPhone|iPod|Blackberry|Windows Phone/i.test(navigator.userAgent) || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                $('#wrap_quickview select.inventory').val($('#wrap_quickview select.inventory > option[value="' + get_last_select_value().toString().split('-')[0] + '"]').val()).trigger('change');
            } else {
                $('#wrap_quickview select.inventory > option[value="' + get_last_select_value().toString().split('-')[0] + '"]').attr('selected', 'selected').trigger('change');
            }
        } else {
            if ($(this).val() != "") {
                refresh_selects(index);
            }
        }
    });

    $('#wrap_quickview .upgrade_topic_title').css({
        "display": "none"
    });
    return true;
}

function str_to_arr(str) {
    var temp_arr = [];
    $.each(str.split(';'), function (k, v) {
        temp_arr.push(v);
    });
    return temp_arr;
}

function get_last_select_value() {
    let temp_upg = itemUpgrades,
        temp;
    for (var i = 0; i < num_of_levels; i++) {
        temp = $('#wrap_quickview select.fake_select.level_' + i).val();
        if (temp == "" || temp == null)
            return temp_upg;
        temp_upg = temp_upg[temp];
    }
    return temp_upg;
}

function refresh_selects(index) {
    let temp_upg = itemUpgrades,
        temp;
    for (var i = 0; i < num_of_levels; i++) {
        temp = $('#wrap_quickview select.fake_select.level_' + i).val();
        if (temp == "")
            return true;
        if (temp == null)
            return enable_select(i, temp_upg, index);
        temp_upg = temp_upg[temp];
    }
    return temp_upg;
}

function reset_selects(select_element, level) {
    if (level == 0) // can't reset the first select
        return false;
    $(select_element).children('option').first().attr('selected', 'selected'); // resets the real upgrade
    for (i = level; i < num_of_levels; i++) { // reset all the selects afterwards
        $('#wrap_quickview select.level_' + i).html("").attr('disabled', true);
    }
    return true;
}

function enable_select(level, obj, index) {
    $elem = $('#wrap_quickview select.fake_select.level_' + level);
    $elem.append(createOptions(obj));
    $elem.removeAttr('disabled');
    return true;
}

function createOptions(obj) {
    var result = '<option value="">בחר</option>\n',
        out_of_stock_data_attr = "";
    $.each(obj, function (k, v) {
        if (typeof v == "string") {
            var kn = k;
            if (v.split('-')[2].length) {
                if (!(Number(v.split('-')[2]) == 0))
                    kn += " - " + v.split('-')[2] + " " + $('#wrap_quickview label.inventory').attr('data-currency');
            }
            if (v.split('-')[1] == "0" || v.split('-')[1] == "") {
                out_of_stock_data_attr = " out_of_stock";
                kn += " - " + $('#wrap_quickview label.inventory').attr('data-stock-text');
            }
            result += '<option value="' + k + '"' + out_of_stock_data_attr + '>' + kn + '</option>\n';
        } else {
            result += '<option value="' + k + '">' + k + '</option>\n';
        }
    });
    return result;
}

function check_for_stock(inti) {
    var in_stock = Number(inti);
    if (isNaN(in_stock) || in_stock <= 0)
        return false;
    return true;
}

function localSelectChanged_qv() {
    var sum = Number($("#wrap_quickview .price_value").attr("content"));
    $("#wrap_quickview select option:selected").each(function () {
        if ($(this).val()) {
            value = item_upgrades_js[$(this).val()];
            if (isNaN(value) == false) {
                sum += value;
            }
        }
    });

    if (!((sum ^ 0) === sum)) {
        sumStr = Number(sum).toFixed(2);
    } else {
        sumStr = sum;
    }

    if (sum == origin_price) {
        $('#wrap_quickview .price_value').html(sumStr + ' ₪');
        $("#wrap_quickview a.link_payments_table").attr("href", "/items/4608337/payments");
    } else {
        $('#wrap_quickview .price_value').html(sumStr + ' ₪ ' + "<span class='tiny'>כולל שדרוגים</span>");
        $("#wrap_quickview a.link_payments_table").attr("href", "/items/4608337/payments?total_price=" + sum);
    }
    if ($('#wrap_quickview .price_value').length) {
        $('#wrap_quickview .price_value').html($('#wrap_quickview .price_value').html().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    }
};

function check_must_upgrade_qv(arr_of_upgrades) {
    var ret_boolean = [];
    var checkbox_and_radio_obj = {};
    if (arr_of_upgrades.length > 0) {
        $.each(arr_of_upgrades, function (index, upgrade) {
            if ($(this).attr('type') == "radio" || $(this).attr('type') == "checkbox") {
                if (!($(this).parent().parent().parent().hasClass('upgrade_is_checked')) && !($(this).parent().parent().hasClass('upgrade_is_checked'))) {
                    if ($(this).is(':checked')) {
                        checkbox_and_radio_obj[$(this).attr('name')] = true;
                        if ($(this).parent().parent().parent().hasClass('checkbox-group')) {
                            $(this).parent().parent().parent().addClass('upgrade_is_checked');
                        } else {
                            $(this).parent().parent().addClass('upgrade_is_checked');
                        }
                    } else {
                        checkbox_and_radio_obj[$(this).attr('name')] = false;
                    }
                }
            } else {
                if ($(this).val() == "" || $(this).val() == null || $(this).val() == undefined) {
                    ret_boolean.push($(this));
                } else {
                    ret_boolean.push(true);
                }
            }
        });
        var counter = 0;
        var true_counter = 0;
        if (!$.isEmptyObject(checkbox_and_radio_obj)) {
            $.each(checkbox_and_radio_obj, function (key, value) {
                counter++;
            });
            $.each(checkbox_and_radio_obj, function (key, value) {
                if (value == false) {
                    ret_boolean.push($('[name="' + key + '"]'));
                }
                if (value == true) {
                    true_counter++;
                }
                if (counter == true_counter) {
                    ret_boolean.push(true);
                }
            });
        } else {
            ret_boolean.push(true);
        }
    } else {
        ret_boolean.push(true);
    }
    return ret_boolean;
}

// -------------------------------- end functions upgrades stock from item page -----------------------------------


// -------------------------------- special hybrids from item page -----------------------------------

// ----------------------- upgrades radio -> checkbox -----------------------------------
const radioToCheckboxQV = () => {
    try {
        $("#wrap_quickview").on("openqv", function () {
            // radio -> checkbox
            $(".item_upgrades_with_images .checkbox-group label").each(function (index) {
                var current_input = $(this).find("input[type='radio']");
                if (current_input.attr('type') == "radio") {
                    $(this).find("input[type='radio']").attr('type', 'checkbox');
                }
            });
        });
    } catch (error) {
        console.log("radio to checkbox error: " + error);
    }
}

// ----------------------- inventory matrix pictures -----------------------------------
const inventoryMatrixPicturesQV = () => {
    console.log("boom");
    try {
        console.log("boom1");
        $("#wrap_quickview").on("loadedqv", function () {
            setTimeout(function () {

                //create pics
                $('#wrap_quickview #item_details label.pic_inventory.inventory').each(function () {
                    var this_upgrade = $(this);

                    $(this).find('.fake_selects > div').each(function (index, el) {
                        var curr_fake_select = index;
                        $(this).after('<div class="qv_inventory_pics qv_inventory_pics_' + curr_fake_select + '"><ul></ul></div>');
                        this_upgrade.find('select.inventory option').each(function () {
                            exists = false;
                            if ($(this).attr('data-title') != undefined && $(this).attr('data-title') != '' && $(this).attr('data-image') != undefined && $(this).attr('data-image') != '') {
                                var this_value = $(this).attr('data-values').split(';')[curr_fake_select].trim();
                                this_upgrade.find('.fake_selects > .qv_inventory_pics_' + curr_fake_select + ' ul li').each(function () {
                                    if ($(this).attr('data-title') == this_value) {
                                        exists = true;
                                        return false;
                                    }
                                });
                                if (!exists) {
                                    var imgUrl = $(this).attr('data-image');
                                    this_upgrade.find('.fake_selects > .qv_inventory_pics_' + curr_fake_select + ' ul').append("<li data-title='" + this_value + "' data-img-src='" + imgUrl + "' style='background-image: url(" + imgUrl + ");'></li>");

                                }
                            }
                        });
                    });

                    this_upgrade.find('.fake_selects > .qv_inventory_pics_0 ul li').addClass('enabled');

                    //when box clicked make it "active" and update its select with the selected value
                    this_upgrade.find('.fake_selects > .qv_inventory_pics ul li').click(function () {
                        if ($(this).hasClass('enabled')) {
                            if ($(this).closest('.qv_inventory_pics').hasClass('qv_inventory_pics_0')) {
                                this_upgrade.find('.fake_selects > .qv_inventory_pics ul li').removeClass('active');
                                let title = $(this).attr('data-title');
                                if ($(this).closest('.qv_inventory_pics').prev().find('label > span').length) {
                                    $(this).closest('.qv_inventory_pics').prev().find('label > span').text(" - " + title);
                                } else {
                                    $(this).closest('.qv_inventory_pics').prev().find('label').append('<span> - ' + title + '</span>');
                                }
                                if (!$('div#item_details label.pic_inventory.inventory .fake_selects  label.level_1 span').length) {
                                    $('div#item_details label.pic_inventory.inventory .fake_selects  label.level_1').append('<span> - בחר צבע לצפייה בתמונה</span>');
                                } else {
                                    $('div#item_details label.pic_inventory.inventory .fake_selects  label.level_1 span').show();
                                }
                                // $('#lightSlider li.active').removeClass('active');
                                // $('#lightSlider li:not(.clone)').each(function(){
                                //     if($(this).find('img').attr('alt') == title){
                                //         $(this).addClass('active')
                                //     }
                                // })
                            } else if ($(this).closest('.qv_inventory_pics').hasClass('qv_inventory_pics_1')) {
                                $(this).closest('.qv_inventory_pics').find('li').removeClass('active');
                                $('div#item_details label.pic_inventory.inventory .fake_selects  label.level_1 span').hide();
                            }
                            $(this).addClass('active');
                            var curr_value = $(this).attr('data-title');
                            $(this).closest('.qv_inventory_pics').prev().find('select').val(curr_value);
                            $(this).closest('.qv_inventory_pics').prev().find('select').trigger('change');
                        }
                    });

                    //enable sec_option for first_option when first_option is selected
                    this_upgrade.find('.fake_selects select.fake_select.pos_0.level_0').change(function () {
                        this_upgrade.find('.fake_selects > .qv_inventory_pics_1 ul li').removeClass('enabled').removeClass('disabled');
                        var selected_first_option = $(this).val();
                        if (selected_first_option != '') {
                            //go over all sec_option boxes
                            this_upgrade.find('.fake_selects > .qv_inventory_pics_1 ul li').each(function () {
                                var curr_sec_option = $(this);
                                var sec_option_title = $(this).attr('data-title');
                                //go over all original upgrade options that include the current sec_option we're inspecting
                                this_upgrade.find('select.inventory option[data-values*="' + sec_option_title + '"]').each(function () {
                                    //if the option also has the selected first_option- make the sec_option enabled
                                    if (!curr_sec_option.closest('.qv_inventory_pics').prev().find('select option[value="' + sec_option_title + '"]').text().includes('חסר במלאי')) {
                                        var hasValue = false;
                                        var arr = $(this).attr('data-values').split(';');
                                        $.each(arr, function (index, value) {
                                            if (value.trim() === selected_first_option.trim()) {
                                                hasValue = true;
                                                return false;
                                            }
                                        });
                                        if (hasValue) {
                                            curr_sec_option.addClass('enabled').removeClass('disabled');
                                            return false;
                                        } else {
                                            curr_sec_option.addClass('disabled').removeClass('enabled');
                                        }
                                    } else {
                                        curr_sec_option.addClass('disabled').removeClass('enabled');
                                    }
                                });
                            });
                        }
                    });

                });

                $('#wrap_quickview div#item_details label.pic_inventory.inventory .fake_selects > .qv_inventory_pics.qv_inventory_pics_0 li').each(function () {
                    $(this).text($(this).data('title'));
                })

                $('#wrap_quickview div#item_details label.pic_inventory.inventory .fake_selects > .qv_inventory_pics.qv_inventory_pics_1 ul li').each(function () {
                    $(this).html('<span>' + $(this).attr('data-title') + '</span>');
                });

                if ($("#wrap_quickview .qv_inventory_pics").length != 0) {
                    $("#wrap_quickview div#item_details label.pic_inventory.inventory .fake_selects > div:not(.qv_inventory_pics) select").css({
                        "display": "none"
                    });
                }
            }, 1000);
        });
    } catch (error) {
        console.log("inventoryMatrixPicturesQV error: " + error);
    }
}

// ----------------------------- upgrades cubes ----------------------------------------
const upgradesCubesQV = () => {
    /*  ------------------------------- Constructors ------------------------------- */
    function upgrade_object_qv(id, name, options_arr) {
        this.id = id;
        this.name = name;
        this.options = options_arr;
    } // upgrade_ctor

    function option_qv(name, price, value, qty) {
        this.name = name;
        this.price = price;
        this.value = value;
        this.qty = qty;
    } // option ctor
    /*  ------------------------------- END  Constructors ------------------------------- */


    /*  ================================================ Functions Scope ================================================  */
    function upgrades_arr_qv() {
        var upgrades = [];
        $("#wrap_quickview .inventory.must_upgrade select").each(function () {
            var options_arr = [];
            $(this).find('option').each(function () {
                if ($(this).attr('value') != "") {

                    var opt_name = $(this).attr('data-title');
                    var opt_price = $(this).attr('data-price');
                    var opt_val = $(this).attr('value');
                    var opt_qty = $(this).attr('data-stock');

                    options_arr.push(new option_qv(opt_name, opt_price, opt_val, opt_qty))
                } // if it's not an empty option


            }); // build the options object to arr
            var id = $(this).attr('id');
            var title = $(this).attr('data-topic-title');
            upgrades.push(new upgrade_object_qv(id, title, options_arr));

            $(this).parent().addClass("hideoneqv") // QV 
            $(".hideoneqv").prev().hide();
        }); // runs on each option
        return upgrades;
    } // upgrades objects arr

    function build_upgrades_fields_qv(arr) {
        $('#wrap_quickview #item_upgrades_top').append('<div id="special_upgrade-wrapper"></div>');
        $.each(arr, function (index, upgrade) {

            var id = this.id;
            var title = this.name;
            $('#wrap_quickview #special_upgrade-wrapper').append('<h3 class="upgrade_title">' + title + '</h3><ul class="special_upgrade" data-id="' + id + '"></ul>')

            $.each(this.options, function () {

                var upgrade_name = this.name;
                var opt_price = this.price;
                var qty = this.qty;
                var val = this.value;
                //console.log(this);
                $('#wrap_quickview ul[data-id=' + id + ']').append('<li data-price="' + opt_price + '" data-qty="' + qty + '" value="' + val + '">' + upgrade_name + '</li>');

            }); // inner each


        }); // outer each

    } // this function build the fields to the DOM

    function starter_qv() {
        var arr = upgrades_arr_qv();
        build_upgrades_fields_qv(arr);
        setListeners_qv();

    }

    function setUpgrade_qv(upgradeId, optionVal) {
        $('#wrap_quickview #' + upgradeId + ' option[value=' + optionVal + ']').attr('selected', true).attr('selected', 'selected').siblings().removeAttr('selected').removeAttr('selected');
        $('#wrap_quickview #' + upgradeId + ' option[value=' + optionVal + ']').trigger('change');
        $('#wrap_quickview #' + upgradeId + '').val(optionVal);
        console.log('succeeded on iphone ' + $('#' + upgradeId + '').val());
        //$('#'+ upgradeId + ' option[value='+ optionVal +']').prop('selected',true).siblings().removeProp('selected');

    }

    function setSelection_qv() {

        if ($('#wrap_quickview .special_upgrade.dup .active').length == $('.special_upgrade.dup').length) {
            var selection = "";
            var length = $('#wrap_quickview .special_upgrade.dup .active').length;
            counter = 1;
            $('#wrap_quickview .special_upgrade.dup .active').each(function () {
                if (length == counter) {
                    selection += '-';
                }
                selection += $(this).text().trim();
                counter++;
            });

            //console.log(selection);
            $("#wrap_quickview .special_upgrade").not(".dup").find('li').each(function () {

                var text = $(this).text().trim().replace(/ /g, '');
                //console.log(selection);

                //console.log('The Selection is ' + selection + ' and current li is  ' + text);
                if (text == selection) {

                    $(this).click().trigger('click');

                }


            });


        } // if statement

    } // set selection function will be called only when inventory double upgrade exist

    function setDoubleUpgrade_qv() {

        $('#wrap_quickview #special_upgrade-wrapper').each(function () {

            var upgrade0 = $(this).find('.upgrade_title:first-child').text().split('-')[0].trim();
            var upgrade1 = $(this).find('.upgrade_title:first-child').text().split('-')[1].trim();
            var obj_upgrade0 = {
                name: upgrade0,
                sizes: []
            };
            var obj_upgrade1 = {
                name: upgrade1,
                sizes: []
            };

            $(this).find('.special_upgrade:nth-of-type(1) li').each(function () {

                obj_upgrade0.sizes.push($(this).text().split('-')[0]);
                obj_upgrade1.sizes.push($(this).text().split('-')[1]);
            });
            obj_upgrade0.sizes = ArrNoDupe_qv(obj_upgrade0.sizes);
            obj_upgrade1.sizes = ArrNoDupe_qv(obj_upgrade1.sizes);

            //console.log(obj_upgrade0);
            //console.log(obj_upgrade1);
            var objs = [obj_upgrade0, obj_upgrade1];
            var count = 0;
            $.each(objs, function (key, value) {

                var section_name = this.name;
                $('#wrap_quickview #special_upgrade-wrapper').append('<h3 class="upgrade_title">' + this.name + '</h3');
                $('#wrap_quickview #special_upgrade-wrapper').append('<ul data-position=' + count + ' data-section="' + this.name + '"class="special_upgrade dup pos_' + count + '"></ul>');
                count++;
                $.each(this.sizes, function (key, value) {
                    $('ul[data-section="' + section_name + '"]').append('<li class="upgrade_title">' + value + '</li');
                }); // outer obj array each

            }); // outer each

        }); // outer each

        setListeners_qv();

        $('#wrap_quickview .special_upgrade.dup li').click(function () {
            setSelection_qv();

        });

    } // set double val upgrade for inventory upgrades that combined e.g 31-10

    function ArrNoDupe_qv(a) {
        var temp = {};
        for (var i = 0; i < a.length; i++)
            temp[a[i]] = true;
        var r = [];
        for (var k in temp)
            r.push(k);
        return r;
    }

    /*  ================================================ End Functions Scope ================================================  */


    /* ================= Event Listener =============== */
    function setListeners_qv() {

        $('#wrap_quickview ul.special_upgrade li').click(function () {

            $(this).siblings('.active').removeClass('active');
            $(this).addClass('active');
            var id = $(this).parent().attr('data-id');
            var value = $(this).attr('value');
            setUpgrade_qv(id, value)
        });

    }

    function checkMatchs_qv() {

        $('#wrap_quickview .special_upgrade.dup.pos_0 li').click(function () {
            var search_term = [];
            $('#wrap_quickview .special_upgrade.dup .hide').removeClass('hide');
            $('#wrap_quickview .special_upgrade.dup .verified').removeClass('verified');
            var clickedSize = $(this).text().trim();
            var opposite_pos = ""
            var pos = Number($(this).parent().attr('data-position'));
            var opposite_pos = Number($(this).parent().siblings('.dup').attr('data-position'));
            search_term[pos] = clickedSize;



            $(this).parent().siblings('.dup').find('li').each(function () {

                search_term[opposite_pos] = $(this).text().trim();

                //console.log(search_term);

                var count = 0;
                $('#wrap_quickview ul.special_upgrade').first().find('li').each(function () {
                    var main_tables_sizes = $(this).text().trim().replace(/ /g, '').split('-');
                    if (main_tables_sizes[0] == search_term[0] && main_tables_sizes[1] == search_term[1]) {
                        count++;
                    }



                }); // each on main table

                if (count < 1) {

                    $(this).addClass('hide');
                } else {

                    $(this).addClass('verified');
                }

            });

        }); // click event

    } // click listener function

    /* ================= end Event Listener =============== */





    try {
        $(document).ready(function () {
            $("#wrap_quickview").on("openqv", function () {

                $('#wrap_quickview .inventory').parent('.must_upgrade').parent().addClass('hide');
                setTimeout(function () {
                    starter_qv();

                    $('#wrap_quickview ul.special_upgrade li').each(function (index, el) {
                        if ($(this).attr('data-qty') == 0) {
                            $(this).css('background', 'linear-gradient(25deg,' + out_of_stock_back + ' 49%,#000 50%,' + out_of_stock_back + ' 51%)');
                            $(this).css('color', out_of_stock_color);
                        }
                    });
                    $('#wrap_quickview div#item_upgrades_top > div#item_upgrades').css('display', 'block')

                    if ($('#wrap_quickview .double.inventory').length) {
                        $('#wrap_quickview#special_upgrade-wrapper .special_upgrade').css('display', 'none');
                        $('#wrap_quickview #special_upgrade-wrapper .special_upgrade').prev().css('display', 'none');

                        setDoubleUpgrade_qv();

                        $('#wrap_quickview #special_upgrade-wrapper .special_upgrade').first().find('li').each(function () {
                            if ($(this).attr('data-qty') == "0") {
                                $(this).remove();
                            }

                            // set buttons listener
                            checkMatchs_qv();
                        });


                        $('#wrap_quickview #special_upgrade-wrapper .special_upgrade').each(function () {
                            $(this).find('li').each(function () {
                                if ($(this).attr('data-qty') == "undefined") {
                                    $(this).parent().remove();
                                }
                            })
                        });

                        //remove fake selects for validation
                        $("#wrap_quickview .must_upgrade div.fake_selects").remove();
                    }
                }, 500);
                console.log('grid modification done');
            });

        });

        $("#wrap_quickview").on("openqv", function () {
            $('#wrap_quickview ul.special_upgrade li').click(function () {

            });
            if ($('#wrap_quickview ul.special_upgrade li.active').attr('data-qty') == 0) {
                $('#wrap_quickview #item_link_buy_now .contactNow').show();
                $('#wrap_quickview #item_link_buy_now .buyNow').hide();
            } else {
                $('#wrap_quickview #item_link_buy_now .contactNow').hide();
                $('#wrap_quickview #item_link_buy_now .buyNow').show();
            }
        });
    } catch (error) {
        console.log("upgrades to cubes: " + error);
    }
}




// ----------------------------- flow special hybrids ----------------------------------
$(document).ready(function () {
    try {
        if (use_upgrade_radio_checkbox == "true") {
            radioToCheckboxQV();
        }

        if (use_inventory_matrix_pictures == "true") {
            inventoryMatrixPicturesQV();
        }

        if (use_upgrades_cubes == "true") {
            upgradesCubesQV();
        }
    } catch (error) {
        console.log("special upgrades error: " + error);
    }
})