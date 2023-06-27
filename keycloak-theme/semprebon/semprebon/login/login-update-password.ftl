<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
    <#elseif section = "form">
        <form id="kc-passwd-update-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
<ul>
<li>
${msg("customMinLength")}
</li>
<li>
${msg("custonNotUsername")}
</li>
<li>
${msg("customSpecialChars")}
</li>
<li>
${msg("customUppercaseChars")}
</li>
<li>
${msg("customLowecaseChars")}
</li>
<li>
${msg("customDigits")}
</li>
<li>
${msg("customExpirePwd")}
</li>
</ul>
            <input type="text" id="username" name="username" value="${username}" autocomplete="username"
                   readonly="readonly" style="display:none;"/>
            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcInputWrapperClass!}">
                    <input placeholder="${msg("passwordNew")}"  type="password" id="password-new" name="password-new" class="${properties.kcInputClass!}"
                           autofocus autocomplete="new-password" onkeypress="clearErrors()"
                           aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                    />

                    <#if messagesPerField.existsError('password')>
                        <span id="input-error-password" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcInputWrapperClass!}">
                    <input placeholder="${msg("passwordConfirm")}" type="password" id="password-confirm" name="password-confirm"
                           class="${properties.kcInputClass!}"  onkeypress="clearErrors()"
                           autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                    />

                    <#if messagesPerField.existsError('password-confirm')>
                        <span id="input-error-password-confirm" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>

                </div>
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <#if isAppInitiatedAction??>
                            <div class="checkbox">
                                <label><input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked> ${msg("logoutOtherSessions")}</label>
                            </div>
                        </#if>
                    </div>
                </div>

                <div id="custom-errors" style="color: #e14b4b; font-weight: bold;"></div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                <div class="custom-btn ${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" value="" onclick="pwd()">${msg("doSubmit")}</div>
                    <#if isAppInitiatedAction??>
                        <input  style="display:none;" class="realButtonSend ${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doSubmit")}" />
                        <button class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}" type="submit" name="cancel-aia" value="true" />${msg("doCancel")}</button>
                    <#else>
                        <input style="display:none;" class="realButtonSend ${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doSubmit")}" />
                    </#if>
                </div>
            </div>
        </form>
    </#if>
<script>
function clearErrors() {
    document.querySelector('#custom-errors').innerHTML = '';
}

function pwd() {
    const newPwd = document.querySelector('#password-new').value;
    const confirmPwd = document.querySelector('#password-confirm').value;

    if(newPwd !== confirmPwd) {
        document.querySelector('#custom-errors').innerHTML = 'Le due password non coincidono';
        return; 
    }

    const matcher = new RegExp("^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]{8,}$");
    if(!!newPwd.match(matcher) && !!confirmPwd.match(matcher)) {
        document.querySelector('.realButtonSend').click();
        return;
    } 

    document.querySelector('#custom-errors').innerHTML = 'Password policy non rispettata';
}
</script>
</@layout.registrationLayout>
