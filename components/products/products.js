(function() {
    function Products() {
        var _this = this;
        _this.products = [];
        _this.getCartItems = function() {
            var url = "./assets/services/cart.json";
            $.getJSON(url, function(result) {
                    if (result.hasOwnProperty("productsInCart") && result.productsInCart.length) {
                        _this.products = result.productsInCart;
                        _this.generateCartTemplate(result.productsInCart);
                    }
                })
                .fail(function(er) {
                    console.log("error", er.responseText);
                });
        }
        _this.generateCartTemplate = function(products) {
            var template = "";
            _.each(products, function(item) {
                var disPlayPrice = "<span><sup>" + item.c_currency + "</sup>" + (item.p_quantity * (item.p_price).toFixed(2)) + "</span>";
                var orginalPrice = "<span class='original_price'><sup>" + item.c_currency + "</sup>" + (item.p_originalprice).toFixed(2) + "</span>";
                var price = item.p_price == item.p_originalprice ? disPlayPrice : orginalPrice + disPlayPrice;
                template += "<div class='product-item'>" +
                    "<div class='product-image col-md-2 col-sm-3 col-xs-5'>" +
                    "<img src='assets/images/T" + item.p_id + ".jpg' alt='" + item.p_name + "'></div>" +
                    "<div class='product-detail col-md-10 col-sm-9 col-xs-7'>" +
                    "<div class='row'>" +
                    "<div class='product-specification col-xs-12'>" +
                    "<h4 class='product-name'>" + item.p_name + "</h4>" +
                    "<label class='lbl-block'>Style #:" + item.p_style.toUpperCase() + "</label>" +
                    " <label class='lbl-block'>Color : <span>" + item.p_selected_color.name + "<span></label>" +
                    "</div>" +
                    "<div class='product-orderInfo col-xs-12'>" +
                    "<label class='lbl-inlineBlock col-md-4 col-sm-4'>" + item.p_selected_size.code + "</label>" +
                    "<label class='lbl-inlineBlock col-md-4 col-sm-4'><input type='text' class='qty' name='qty' value='" + item.p_quantity + "' placeholder=''></label>" +
                    "<label class='lbl-inlineBlock col-md-4 col-sm-4 price' data-price='" + item.p_price + "'>" + price + "</label>" +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "<div class='product-buttons col-md-10 col-sm-6 col-xs-12'>" +
                    "<button class='button' data-product-id='" + item.p_id + "' data-button-type='edit' id='editButton'>Edit</button>" +
                    "<button class='button' data-product-id='" + item.p_id + "' data-button-type='remove'id='removeButton'>X Remove</button>" +
                    "<button class='button' data-product-id='" + item.p_id + "' data-button-type='save' id='save'>Save for Later</button>" +
                    "</div></div>";
            });

            var productCount = _.size(products);
            var postFixLabel = productCount > 1 ? "Items" : "item";
            var cartTotalItemCount = "<b>" + productCount + " </b>" + postFixLabel
            _this.updateCart(template, cartTotalItemCount);
        }
        _this.updateProductsInCart = function(obj, products) {
            $.each(products, function() {
                if (this.p_id == obj.id) {
                    this.p_selected_color = obj.color;
                    this.p_quantity = obj.qty;
                    this.p_selected_size = obj.size;
                }
            });
            _this.generateCartTemplate(products);
        }
        _this.updateCart = function(template, cartTotalItemCount) {
            document.getElementById("noOfProducts").innerHTML = cartTotalItemCount;
            document.getElementById("products").innerHTML = template;
            _this.updateBill();
            $("body").addClass("active");
        }
        _this.updateBill = function() {
            var priceElement = $(document).find(".product-orderInfo .price");;
            var total = 0;
            priceElement.each(function() {
                var qty = parseInt($(this).prev().find("input").val());
                total += (qty * parseInt($(this).attr("data-price")));
            });
            var updatedPrice = _this.checkDiscount(total);
            document.getElementById("subTotal").innerHTML = "<sup>$</sup>" + (total.toFixed(2));
            document.getElementById("estimatedPrice").innerHTML = "<sup>$</sup>" + (updatedPrice.price.toFixed(2));
            document.getElementById("discountPrice").innerHTML = "-<sup>$</sup>" + (updatedPrice.discountPrice.toFixed(2));
            document.getElementById("offerCode").innerHTML = "JF" + updatedPrice.offer;
        }
        _this.checkDiscount = function(totalPrice) {
            var updatedPrice = {
                offer: 0,
                discountPrice: 0,
                price: 0
            }
            totalPrice = totalPrice.toFixed(2);
            var productCount = _.size(_this.products);
            $(".qty").each(function() {
                productCount += parseInt($(this).val());
            });

            if (!productCount) return;
            if (productCount < 3) {
                updatedPrice.offer = 5;
            } else if (productCount > 3 && productCount < 6) {
                updatedPrice.offer = 10;
            } else {
                updatedPrice.offer = 25;
            }
            updatedPrice.discountPrice = ((totalPrice / 100) * updatedPrice.offer);
            updatedPrice.price = (totalPrice - updatedPrice.discountPrice.toFixed(2));
            return updatedPrice;
        }
        _this.getProductByProductId = function(productId, products) {
            var results = $.map(products, function(item, i) {
                if (item.p_id == productId) return item;
            });
            return results;
        }
        _this.generateModalTemplate = function(product) {
            var disPlayPrice = "<span><sup>" + product.c_currency + "</sup>" + (product.p_price).toFixed(2) + "</span>";
            var colors = "";
            var sizes = "<select id='edit_size'  class='form-control' data-selected-size='" + product.p_selected_size.code + "'><option value=''>SIZE</option>";
            if (product.hasOwnProperty("p_available_options")) {
                if (product.p_available_options.hasOwnProperty("colors") && product.p_available_options.colors.length) {
                    _.each(product.p_available_options.colors, function(item) {
                        var selected = product.p_selected_color.name == item.name ? "checked='checked' />" : "/>"
                        colors += "<label class='radiobutton'  id='" + item.name + "' style='background-color:" + item.hexcode + "'>" +
                            "<input type='radio' data-selected-color='" + product.p_selected_color.name + "' data-color-hexaCode='" + item.hexcode + "' class='edit_color' name='size' id='size_" + item.name + "' value='" + item.name + "'" + selected + " <div class='radioBtn'></div></label>";
                    });
                }
                if (product.p_available_options.hasOwnProperty("sizes") && product.p_available_options.sizes.length) {
                    _.each(product.p_available_options.sizes, function(item) {
                        var selected = product.p_selected_size.code == item.code ? "selected='selected'>" : ">"
                        sizes += "<option value='" + item.code + "'" + selected + item.code + "</option>";
                    });
                }
            }
            var qty = "<select id='edit_qty' class='form-control' data-selected-qty='" + product.p_quantity + "'><option value=''>QTY</option>";
            for (var i = 1; i < 10; i++) {
                var selected = product.p_quantity == i ? "selected='selected'>" : ">"
                qty += "<option value='" + i + "'" + selected + "QTY:" + i + "</option>";
            }
            qty += "</select>";
            sizes += "</select>";
            var template = "<div class='modal-item'>" +
            "<div class='product-image col-md-6 col-sm-6 col-xs-12'>" +
                "<img src='assets/images/T" + product.p_id + ".jpg' alt='prodcut1' /></div>" +
                "<div class='product-detail col-md-6 col-sm-6 col-xs-12'>" +
                "<div class='inner-wrapper'>" +
                "<h3>" + product.p_name + "</h3>" +
                "<h5>" + disPlayPrice + "</h5>" +
                "<div class='form-group'>" + colors + "</div><div class='form-inline'>" +
                "<div class='form-group'>" + qty + "</div>" +
                "<div class='form-group'>" + sizes + "</div></div>" +
                "<button class='btn btn-primary' id='edit' data-product-id='" + product.p_id + "'>Edit</button>" +
                "<a class='link'  href='javascript:;'>See product details</a></div>" +
                
                "</div>";

            _this.updateModalWindow(template);
        }
        _this.updateModalWindow = function(template, cartTotalItemCount) {
            document.getElementById("modalContent").innerHTML = template;
        }
    }

    var cart = new Products();
    cart.getCartItems();

    /* Common Js*/
    $(document).on("click", ".product-buttons .button", function(event) {
        event.preventDefault();
        var id = $(this).attr("data-product-id");
        if ($(this).attr("data-button-type") == 'edit') {
            $("#cartModal").modal("show");
            var selectedProdcut = cart.getProductByProductId(id, cart.products);
            if (selectedProdcut.length)
                cart.generateModalTemplate(selectedProdcut[0])

        }
    });
    $(document).on("click", ".modal #edit", function(event) {
        event.preventDefault();
        var id = $(this).attr("data-product-id");
        var parentElem = $(this).closest('#modalContent');
        var sizeElem = parentElem.find("#edit_size");
        var qtyElem = parentElem.find("#edit_qty");
        var colorElem = parentElem.find(".edit_color");

        var qty = parentElem.find("#edit_qty").val();
        if (parseInt(qtyElem.val()) != parseInt(qtyElem.attr("data-selected-qty")) ||
            sizeElem.val() !== sizeElem.attr("data-selected-size") ||
            parentElem.find('.edit_color:checked').val() !== colorElem.attr("data-selected-color")) {

            var obj = {
                id: id,
                color: {
                    name: parentElem.find('.edit_color:checked').val(),
                    hexcode: parentElem.find('.edit_color:checked').attr("data-color-hexaCode"),
                },
                qty: qtyElem.val(),
                size: {
                    name: sizeElem.val(),
                    code: parentElem.find("#edit_size option:selected").text()
                }
            };
            console.log(obj);
            cart.updateProductsInCart(obj, cart.products);
        }
        var id = $(this).attr("data-product-id");
        var selectedProdcut = cart.getProductByProductId(id, cart.products);
        if (selectedProdcut.length) {
            cart.generateModalTemplate(selectedProdcut[0]);
        }
        $("#cartModal").modal("hide");
    });


})();