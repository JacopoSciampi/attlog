<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">
        <form id="kc-reset-password-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
            <div class="${properties.kcFormGroupClass!}">
                <div class="${properties.kcInputWrapperClass!}">
                    <#if auth?has_content && auth.showUsername()>
                        <input placeholder="${msg("usernameOrEmail")}" type="text" id="username" name="username" class="${properties.kcInputClass!}" autofocus value="${auth.attemptedUsername}" aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"/>
                    <#else>
                        <input placeholder="${msg("usernameOrEmail")}" type="text" id="username" name="username" class="${properties.kcInputClass!}" autofocus aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"/>
                    </#if>

                    <#if messagesPerField.existsError('username')>
                        <span id="input-error-username" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>
            <div class="${properties.kcFormGroupClass!} ${properties.kcFormSettingClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    
                </div>

                <div class="${properties.kcFormOptionsWrapperClass!}">
                        <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
                    </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doSubmit")}"/>
                </div>
            </div>
        </form>
    <#elseif section = "info" >
        ${msg("emailInstruction")}
    </#if>
</@layout.registrationLayout>
